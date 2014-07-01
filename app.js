/* Deps */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    poet = require('poet')(app),
    gith = require('gith').create(3001);

/* poet */
poet
  .watch(function () {
    poet.clearCache();
  })
  .init();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'dist')));

app.locals.env = app.get('env');
app.locals.moment = require('moment');

// development only
if (app.locals.env === 'development') app.use(express.errorHandler());

/* This function produces a summary of a post's content, alongside a link to the full story. */
var getSummary = function (post) {
  var summary = new String(post.content);
  return summary.substr(0, 300) + '... <a href=\'' + post.url + '\'> more <i class=\'ion-arrow-right-c\'></i>';
}

/* home */
app.get('/', function (req, res, nxt) {
  var posts = poet.helpers.getPosts(0, 5),
      latest = posts.shift(),
      summary = getSummary(latest);
  res.render('index', {
    posts: posts,
    title: '@waltfy',
    latest: {
      post: latest,
      summary: summary
    }
  });
});

/* single post */
poet.addRoute('/written/:post', function (req, res, nxt) {
  var post = poet.helpers.getPost(req.params.post);
  if (post) {
    res.render('post', {
      post: post,
      title: post.title
    });
  } else {
    res.send(404);
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('waltercarvalho.com running on port ' + app.get('port'));
});

if (app.locals.env !== 'development') {
  gith({repo: 'waltervascarvalho/personal'})
    .on( 'all', function (payload) {
      var sys = require('sys');
      var exec = require('child_process').exec;

      function puts (error, stdout, stderr) { 
        sys.puts(stdout);
      }

      exec(". ~/personal/deploy.sh", puts);
    });  
}
