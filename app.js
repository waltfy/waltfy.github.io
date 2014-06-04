/* Deps */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    poet = require('poet')(app);

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
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res, nxt) {
  var posts = poet.helpers.getPosts(0, 5),
      latest = posts.shift(),
      summary = getSummary(latest);

  res.render('index', {posts: posts, title: '@waltfy', latest: { post: latest, summary: summary } })
});

poet.addRoute('/written/:post', function (req, res, nxt) {
  var post = poet.helpers.getPost(req.params.post);
  if (post) {
    res.render('post', { post: post, title: post.title });
  } else {
    res.send(404);
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('waltercarvalho.com running on port ' + app.get('port'));
});

/* This function produces a summary of a post's content, alongside a link to the full story. */
var getSummary = function (post) {
  var summary = new String(post.content);
  return summary.substr(0, 300) + '... <a href=\'' + post.url + '\'> more <i class=\'ion-arrow-right-c\'></i>';
}

