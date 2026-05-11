(() => {
  const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

  const fmtMoney = (v) => {
    if (!isFinite(v)) return '—';
    const code = state.currency || '$';
    const sign = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    const sep = code.length === 1 ? '' : ' ';
    return sign + code + sep + abs.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const uid = () => Math.random().toString(36).slice(2, 9);

  const defaultSeries = (i = 0) => ({
    id: uid(),
    name: `Series ${i + 1}`,
    color: PALETTE[i % PALETTE.length],
    enabled: true,
    initial: 0,
    rate: 5,
    years: 50,
    delay: 0,
    compounding: 1,
    contribAmount: 100,
    contribFreq: 12,
    stopAfter: 0,
  });

  let state = {
    currency: '$',
    startAge: null,
    activeId: null,
    series: [defaultSeries(0)],
  };
  state.activeId = state.series[0].id;

  // ---------- URL state ----------
  const encodeState = (s) => {
    try {
      const json = JSON.stringify(s);
      return btoa(unescape(encodeURIComponent(json)));
    } catch { return ''; }
  };
  const decodeState = (str) => {
    try {
      const json = decodeURIComponent(escape(atob(str)));
      return JSON.parse(json);
    } catch { return null; }
  };
  const loadStateFromUrl = () => {
    // Prefer query string; fall back to legacy hash format.
    let enc = new URLSearchParams(window.location.search).get('s');
    if (!enc) {
      const m = window.location.hash.match(/[#&]s=([^&]+)/);
      enc = m ? m[1] : null;
    }
    if (!enc) return;
    const decoded = decodeState(enc);
    if (decoded && Array.isArray(decoded.series) && decoded.series.length) {
      state = decoded;
    }
  };
  let urlUpdateTimer = null;
  const syncUrl = () => {
    clearTimeout(urlUpdateTimer);
    urlUpdateTimer = setTimeout(() => {
      const enc = encodeState(state);
      // Preserve any active anchor (e.g. #learn) so in-page nav coexists with state sharing.
      const anchor = window.location.hash && !/[#&]s=/.test(window.location.hash) ? window.location.hash : '';
      history.replaceState(null, '', '?s=' + enc + anchor);
    }, 200);
  };

  // ---------- Math ----------
  const simulate = (s) => {
    const totalYears = Math.max(1, s.years || 0);
    const delay = Math.min(totalYears, Math.max(0, Math.round(s.delay || 0)));
    const activeMonths = Math.max(0, Math.round((totalYears - delay) * 12));

    const annual = (s.rate || 0) / 100;
    const comp = s.compounding || 12;
    const periodRate = annual / comp;
    const monthlyRate = Math.pow(1 + periodRate, comp / 12) - 1;

    const contribFreq = s.contribFreq || 12;
    const monthsPerContrib = Math.max(1, Math.round(12 / contribFreq));
    const contribAmount = s.contribAmount || 0;
    const stopAfterMonths = (s.stopAfter && s.stopAfter > 0) ? Math.round(s.stopAfter * 12) : Infinity;

    const yearly = [];

    // Delay period: nothing invested yet.
    for (let y = 0; y < delay; y++) {
      yearly.push({ year: y, balance: 0, totalContrib: 0, totalInterest: 0, invested: 0 });
    }

    // Initial deposit lands at year=delay.
    let balance = s.initial || 0;
    let totalContrib = 0;
    let totalInterest = 0;
    yearly.push({ year: delay, balance, totalContrib: 0, totalInterest: 0, invested: balance });

    for (let m = 1; m <= activeMonths; m++) {
      const interest = balance * monthlyRate;
      balance += interest;
      totalInterest += interest;
      if (m % monthsPerContrib === 0 && m <= stopAfterMonths) {
        balance += contribAmount;
        totalContrib += contribAmount;
      }
      if (m % 12 === 0) {
        yearly.push({
          year: delay + m / 12,
          balance,
          totalContrib,
          totalInterest,
          invested: (s.initial || 0) + totalContrib,
        });
      }
    }
    return yearly;
  };

  // ---------- DOM refs ----------
  const tabsEl = document.getElementById('seriesTabs');
  const editorEl = document.getElementById('seriesEditor');
  const tableEl = document.getElementById('dataTable');
  const chartCanvas = document.getElementById('chart');
  let chart = null;

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Tab + editor render ----------
  const renderTabs = () => {
    tabsEl.innerHTML = '';
    const tpl = document.getElementById('tabTemplate');
    state.series.forEach((s) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = s.id;
      if (s.id === state.activeId) node.classList.add('active');
      if (!s.enabled) node.classList.add('disabled');
      node.querySelector('.color-dot').style.background = s.color;
      node.querySelector('.tab-name').textContent = s.name || 'Untitled';
      tabsEl.appendChild(node);
    });
  };

  const renderEditor = () => {
    editorEl.innerHTML = '';
    const s = state.series.find((x) => x.id === state.activeId);
    if (!s) return;
    const tpl = document.getElementById('editorTemplate');
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = s.id;
    node.querySelector('.series-name').value = s.name;
    node.querySelector('.series-enabled').checked = s.enabled;
    node.querySelector('.f-initial').value = s.initial;
    node.querySelector('.f-rate').value = s.rate;
    node.querySelector('.f-years').value = s.years;
    node.querySelector('.f-delay').value = s.delay || 0;
    node.querySelector('.f-compounding').value = String(s.compounding);
    node.querySelector('.f-contrib').value = s.contribAmount;
    node.querySelector('.f-contribfreq').value = String(s.contribFreq);
    node.querySelector('.f-stopafter').value = s.stopAfter || 0;
    node.querySelector('.f-color').value = s.color;
    if (state.series.length <= 1) {
      node.querySelector('.delete-series').disabled = true;
      node.querySelector('.delete-series').style.opacity = '0.3';
      node.querySelector('.delete-series').style.cursor = 'not-allowed';
    }
    editorEl.appendChild(node);
  };

  // ---------- Chart + table ----------
  const buildYearAxis = (sims) => {
    const maxYears = Math.max(0, ...sims.map((sim) => sim[sim.length - 1].year));
    const years = [];
    for (let y = 0; y <= Math.ceil(maxYears); y++) years.push(y);
    return years;
  };

  const valueAtYear = (sim, year) => {
    return sim.find((p) => p.year === year) || null;
  };

  const renderChart = () => {
    if (typeof Chart === 'undefined') {
      const wrap = chartCanvas.parentElement;
      if (!wrap.querySelector('.chart-error')) {
        const div = document.createElement('div');
        div.className = 'chart-error';
        div.textContent = 'Chart library failed to load — check your internet connection.';
        wrap.appendChild(div);
      }
      return;
    }
    const enabled = state.series.filter((s) => s.enabled);
    const sims = enabled.map((s) => ({ s, sim: simulate(s) }));
    const allYears = buildYearAxis(sims.map((x) => x.sim));

    const datasets = sims.map(({ s, sim }) => {
      const data = allYears.map((y) => {
        const pt = valueAtYear(sim, y);
        if (!pt) return null;
        return pt.balance;
      });
      return {
        label: s.name,
        data,
        borderColor: s.color,
        backgroundColor: s.color + '33',
        tension: 0.15,
        spanGaps: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      };
    });

    const hasAge = state.startAge != null && state.startAge !== '' && !isNaN(parseInt(state.startAge));
    const startAge = hasAge ? Math.max(0, parseInt(state.startAge)) : null;
    const labels = allYears.map((y) =>
      hasAge ? [`Age ${startAge + y}`, `Yr ${y}`] : `Year ${y}`
    );
    const cfg = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#0f172a' } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.parsed.y)}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: '#e2e8f0' } },
          y: {
            ticks: { color: '#64748b', callback: (v) => fmtMoney(v) },
            grid: { color: '#e2e8f0' },
          },
        },
      },
    };

    try {
      if (chart) {
        chart.data = cfg.data;
        chart.options = cfg.options;
        chart.update('none');
      } else {
        chart = new Chart(chartCanvas, cfg);
      }
    } catch (e) {
      console.error('Chart render failed', e);
    }
  };

  const renderTable = () => {
    const enabled = state.series.filter((s) => s.enabled);
    if (enabled.length === 0) {
      tableEl.innerHTML = '<tbody><tr><td style="padding:20px;color:var(--text-dim)">No series enabled.</td></tr></tbody>';
      return;
    }
    const sims = enabled.map((s) => ({ s, sim: simulate(s) }));
    const allYears = buildYearAxis(sims.map((x) => x.sim));

    const headers = ['Contrib', 'Invested', 'Interest', 'Balance'];
    const span = headers.length;

    const hasAge = state.startAge != null && state.startAge !== '' && !isNaN(parseInt(state.startAge));
    const startAge = hasAge ? Math.max(0, parseInt(state.startAge)) : 0;
    const leadCols = hasAge ? 2 : 1;
    let html = '<thead>';
    html += `<tr class="series-group-row"><th colspan="${leadCols}"></th>`;
    sims.forEach(({ s }) => {
      html += `<th colspan="${span}" style="color:${s.color}">${escapeHtml(s.name)}</th>`;
    });
    html += '</tr><tr class="col-row">';
    if (hasAge) html += '<th>Age</th><th>Year</th>';
    else html += '<th>Year</th>';
    sims.forEach(() => {
      headers.forEach((h, i) => {
        html += `<th class="${i === 0 ? 'col-group-divider' : ''}">${h}</th>`;
      });
    });
    html += '</tr></thead><tbody>';

    allYears.forEach((y) => {
      html += '<tr>';
      if (hasAge) html += `<td>${startAge + y}</td><td class="year-col">${y}</td>`;
      else html += `<td>${y}</td>`;
      sims.forEach(({ sim }) => {
        const pt = valueAtYear(sim, y);
        if (!pt) {
          for (let i = 0; i < span; i++) {
            html += `<td class="${i === 0 ? 'col-group-divider' : ''}">—</td>`;
          }
        } else {
          const cells = [
            fmtMoney(pt.totalContrib),
            fmtMoney(pt.invested),
            fmtMoney(pt.totalInterest),
            fmtMoney(pt.balance),
          ];
          cells.forEach((c, i) => {
            html += `<td class="${i === 0 ? 'col-group-divider' : ''}">${c}</td>`;
          });
        }
      });
      html += '</tr>';
    });
    html += '</tbody>';
    tableEl.innerHTML = html;
  };

  const updateCurrencyLabels = () => {
    const code = state.currency || 'USD';
    document.querySelectorAll('.lbl-initial').forEach((el) => { el.textContent = `Initial (${code})`; });
    document.querySelectorAll('.lbl-contrib').forEach((el) => { el.textContent = `Contribution (${code})`; });
  };

  const renderAll = () => {
    document.getElementById('currency').value = state.currency || '$';
    document.getElementById('startAge').value = state.startAge ?? '';
    renderTabs();
    renderEditor();
    updateCurrencyLabels();
    renderChart();
    renderTable();
    syncUrl();
  };

  // Light update for editing the active series — avoids rebuilding the editor on every keystroke
  const lightUpdate = () => {
    renderTabs();
    renderChart();
    renderTable();
    syncUrl();
  };

  // ---------- Events ----------
  document.getElementById('addSeries').addEventListener('click', () => {
    const base = state.series.find((s) => s.id === state.activeId) || state.series[state.series.length - 1];
    const i = state.series.length;
    const newSeries = base
      ? { ...base, id: uid(), name: `Series ${i + 1}`, color: PALETTE[i % PALETTE.length], enabled: true }
      : defaultSeries(i);
    state.series.push(newSeries);
    state.activeId = newSeries.id;
    renderAll();
  });

  const buildCsv = () => {
    const enabled = state.series.filter((s) => s.enabled);
    const hasAge = state.startAge != null && state.startAge !== '' && !isNaN(parseInt(state.startAge));
    const startAge = hasAge ? Math.max(0, parseInt(state.startAge)) : 0;
    if (enabled.length === 0) return (hasAge ? 'Age,Year' : 'Year') + '\n';
    const sims = enabled.map((s) => ({ s, sim: simulate(s) }));
    const allYears = buildYearAxis(sims.map((x) => x.sim));
    const esc = (v) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const cols = ['Contrib', 'Invested', 'Interest', 'Balance'];
    const header = hasAge ? ['Age', 'Year'] : ['Year'];
    sims.forEach(({ s }) => cols.forEach((c) => header.push(esc(`${s.name} ${c}`))));
    const rows = [header.join(',')];
    allYears.forEach((y) => {
      const row = hasAge ? [startAge + y, y] : [y];
      sims.forEach(({ sim }) => {
        const pt = valueAtYear(sim, y);
        if (!pt) {
          row.push('', '', '', '');
        } else {
          row.push(
            Math.round(pt.totalContrib),
            Math.round(pt.invested),
            Math.round(pt.totalInterest),
            Math.round(pt.balance),
          );
        }
      });
      rows.push(row.join(','));
    });
    return rows.join('\n');
  };

  document.getElementById('copyCsv').addEventListener('click', async () => {
    const csv = buildCsv();
    try {
      await navigator.clipboard.writeText(csv);
      showToast('CSV copied!');
    } catch {
      showToast('Copy failed');
    }
  });

  document.getElementById('currency').addEventListener('input', (e) => {
    state.currency = e.target.value || '$';
    updateCurrencyLabels();
    lightUpdate();
  });

  document.getElementById('startAge').addEventListener('input', (e) => {
    const v = e.target.value;
    state.startAge = v === '' ? null : Math.max(0, parseInt(v) || 0);
    lightUpdate();
  });

  document.getElementById('copyLink').addEventListener('click', async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch {
      showToast('Copy failed — URL is in the address bar');
    }
  });

  // Tab clicks
  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.series-tab');
    if (!tab) return;
    state.activeId = tab.dataset.id;
    renderAll();
  });

  // Editor inputs (live)
  editorEl.addEventListener('input', (e) => {
    const s = state.series.find((x) => x.id === state.activeId);
    if (!s) return;
    const t = e.target;
    if (t.classList.contains('series-name')) s.name = t.value;
    else if (t.classList.contains('f-initial')) s.initial = parseFloat(t.value) || 0;
    else if (t.classList.contains('f-rate')) s.rate = parseFloat(t.value) || 0;
    else if (t.classList.contains('f-years')) s.years = Math.max(1, parseInt(t.value) || 1);
    else if (t.classList.contains('f-delay')) s.delay = Math.max(0, parseInt(t.value) || 0);
    else if (t.classList.contains('f-compounding')) s.compounding = parseInt(t.value);
    else if (t.classList.contains('f-contrib')) s.contribAmount = parseFloat(t.value) || 0;
    else if (t.classList.contains('f-contribfreq')) s.contribFreq = parseInt(t.value);
    else if (t.classList.contains('f-stopafter')) s.stopAfter = Math.max(0, parseInt(t.value) || 0);
    else if (t.classList.contains('f-color')) s.color = t.value;
    else return;
    lightUpdate();
  });

  editorEl.addEventListener('change', (e) => {
    const s = state.series.find((x) => x.id === state.activeId);
    if (!s) return;
    if (e.target.classList.contains('series-enabled')) {
      s.enabled = e.target.checked;
      lightUpdate();
    }
  });

  editorEl.addEventListener('click', (e) => {
    if (!e.target.classList.contains('delete-series')) return;
    if (state.series.length <= 1) return;
    const id = state.activeId;
    const idx = state.series.findIndex((x) => x.id === id);
    state.series = state.series.filter((x) => x.id !== id);
    state.activeId = state.series[Math.max(0, idx - 1)].id;
    renderAll();
  });

  // ---------- Toast ----------
  let toastEl = null;
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };

  // ---------- Example scenarios ----------
  const mkSeries = (overrides) => ({
    id: uid(),
    name: 'Series 1',
    color: PALETTE[0],
    enabled: true,
    initial: 0, rate: 5, years: 50, delay: 0,
    compounding: 1, contribAmount: 100, contribFreq: 12, stopAfter: 0,
    ...overrides,
  });

  const EXAMPLES = [
    {
      title: 'Start at 25: $500/month at 7% for 40 years',
      blurb: 'A classic retirement-by-65 plan. Watch the interest take over the contributions around year 20.',
      state: {
        currency: '$', startAge: 25,
        series: [mkSeries({ name: 'Save $500/mo', color: PALETTE[0], initial: 1000, rate: 7, years: 40, compounding: 12, contribAmount: 500 })],
      },
    },
    {
      title: 'Cost of waiting 10 years',
      blurb: 'Same plan, started at 25 vs 35. The delayed version finishes with roughly half the balance.',
      state: {
        currency: '$', startAge: 25,
        series: [
          mkSeries({ name: 'Start at 25', color: PALETTE[0], initial: 0, rate: 7, years: 40, compounding: 12, contribAmount: 500 }),
          mkSeries({ name: 'Start at 35', color: PALETTE[2], initial: 0, rate: 7, years: 40, delay: 10, compounding: 12, contribAmount: 500 }),
        ],
      },
    },
    {
      title: '5% vs 7% vs 9% returns',
      blurb: 'Three otherwise identical plans. A two-point difference compounds into a six-figure gap over 40 years.',
      state: {
        currency: '$', startAge: 25,
        series: [
          mkSeries({ name: '5% return', color: PALETTE[5], initial: 0, rate: 5, years: 40, compounding: 12, contribAmount: 500 }),
          mkSeries({ name: '7% return', color: PALETTE[0], initial: 0, rate: 7, years: 40, compounding: 12, contribAmount: 500 }),
          mkSeries({ name: '9% return', color: PALETTE[1], initial: 0, rate: 9, years: 40, compounding: 12, contribAmount: 500 }),
        ],
      },
    },
    {
      title: 'House deposit: £750/month at 4% for 8 years',
      blurb: 'Short-horizon savings goal — modest interest, contributions do most of the lifting.',
      state: {
        currency: '£', startAge: null,
        series: [mkSeries({ name: 'Deposit fund', color: PALETTE[1], initial: 5000, rate: 4, years: 8, compounding: 12, contribAmount: 750 })],
      },
    },
    {
      title: 'Early starter still wins: 10 years of saving vs 30',
      blurb: 'Person A saves $500/month for 10 years then stops. Person B starts 10 years later and saves for 30 years. Despite 3× the contributions, B finishes behind.',
      state: {
        currency: '$', startAge: 25,
        series: [
          mkSeries({ name: 'Save 10 yrs then stop', color: PALETTE[0], initial: 0, rate: 7, years: 40, compounding: 12, contribAmount: 500, stopAfter: 10 }),
          mkSeries({ name: 'Start 10 yrs late', color: PALETTE[2], initial: 0, rate: 7, years: 40, delay: 10, compounding: 12, contribAmount: 500 }),
        ],
      },
    },
    {
      title: 'Retirement drawdown: $1M, -$5,500/month',
      blurb: 'A $1M nest egg at 5% with $5,500/month withdrawals depletes over ~25 years. A negative contribution models the drawdown.',
      state: {
        currency: '$', startAge: 65,
        series: [mkSeries({ name: 'Drawdown', color: PALETTE[3], initial: 1000000, rate: 5, years: 30, compounding: 12, contribAmount: -5500 })],
      },
    },
  ];

  const renderExampleLinks = () => {
    const host = document.getElementById('exampleLinks');
    if (!host) return;
    host.innerHTML = '';
    EXAMPLES.forEach((ex) => {
      const enc = encodeState({ ...ex.state, activeId: ex.state.series[0].id });
      const a = document.createElement('a');
      a.className = 'example-card';
      a.href = '?s=' + enc;
      a.dataset.scenario = '1';
      a.innerHTML = `<strong>${escapeHtml(ex.title)}</strong><span>${escapeHtml(ex.blurb)}</span>`;
      host.appendChild(a);
    });
  };

  const WORKED = {
    lump: {
      currency: '£', startAge: null,
      series: [mkSeries({ name: '£10k lump sum', color: PALETTE[0], initial: 10000, rate: 7, years: 30, compounding: 12, contribAmount: 0 })],
    },
    monthly: {
      currency: '£', startAge: null,
      series: [mkSeries({ name: '£500/month', color: PALETTE[0], initial: 0, rate: 7, years: 30, compounding: 12, contribAmount: 500 })],
    },
    wait5: {
      currency: '£', startAge: null,
      series: [
        mkSeries({ name: 'No delay', color: PALETTE[0], initial: 0, rate: 7, years: 30, compounding: 12, contribAmount: 500 }),
        mkSeries({ name: 'Delayed 5 years', color: PALETTE[2], initial: 0, rate: 7, years: 30, delay: 5, compounding: 12, contribAmount: 500 }),
      ],
    },
  };

  const renderWorkedLinks = () => {
    document.querySelectorAll('a.worked-link[data-worked]').forEach((a) => {
      const key = a.getAttribute('data-worked');
      const st = WORKED[key];
      if (!st) return;
      const enc = encodeState({ ...st, activeId: st.series[0].id });
      a.href = '?s=' + enc;
      a.dataset.scenario = '1';
    });
  };

  // Intercept clicks on scenario links so they update state in place (no full reload).
  // Right-click / open-in-new-tab still works because the href is a real URL.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scenario]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const url = new URL(a.href, window.location.href);
    history.pushState(null, '', url.pathname + url.search + url.hash);
    loadStateFromUrl();
    if (!state.currency) state.currency = '$';
    if (state.startAge === undefined) state.startAge = null;
    state.series.forEach((s) => { if (!s.id) s.id = uid(); });
    if (!state.activeId || !state.series.find((s) => s.id === state.activeId)) {
      state.activeId = state.series[0].id;
    }
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Browser back/forward should also reload state.
  window.addEventListener('popstate', () => {
    loadStateFromUrl();
    if (!state.currency) state.currency = '$';
    if (state.startAge === undefined) state.startAge = null;
    state.series.forEach((s) => { if (!s.id) s.id = uid(); });
    if (!state.activeId || !state.series.find((s) => s.id === state.activeId)) {
      state.activeId = state.series[0].id;
    }
    renderAll();
  });

  // ---------- Init ----------
  loadStateFromUrl();
  if (!state.currency) state.currency = '$';
  if (state.startAge === undefined) state.startAge = null;
  state.series.forEach((s) => { if (!s.id) s.id = uid(); });
  if (!state.activeId || !state.series.find((s) => s.id === state.activeId)) {
    state.activeId = state.series[0].id;
  }
  renderAll();
  renderExampleLinks();
  renderWorkedLinks();
})();
