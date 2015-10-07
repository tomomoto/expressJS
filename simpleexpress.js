var express     = require('express'),
    app         = express(),
    mysql       = require('mysql'),
    url         = require('url'),
    session     = require('express-session'),
    SessionStore= require('express-mysql-session'),
    config      = require('config'),
    log         = require('libs/log')(module),
    bodyParser = require('body-parser');
    //,cookieparser=require('cookie-parser');

/*var mysql_options   ={
    host     : 'localhost',
    port     : '3336',
    user     : 'root',
    password : '0909',
    database : 'eventer'
}*/

app.set('view engine', 'ejs');

var options = {
  mysql_options :{
    host: config.get("mysqlServer"),
    port: config.get("mysqlPort"),
    user: config.get("mysqlUser"),
    password: config.get("mysqlPassword"),
    database: config.get("mysqlBD")
  },
  schema: {
    tableName: 'sessions_mysql',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }

};

var mysql_connection_for_session = mysql.createConnection(options.mysql_options);
var mysql_session_storage  = new SessionStore(options,mysql_connection_for_session);

app.use(session({
      secret            : 'i_do_not_know_but_it_is_needed',
      name              : 'eventer_nyam_nyam',
      store             : mysql_session_storage,
      resave            : true,
      saveUninitialized : false,
      user_id           : 0,
      authorized        : false,
      cookie: {
        //user_id : true,
        //httpOnly: false,
        secure  : false
      }
      //,
      //genid             : function(req) {
      // return genuuid() // use UUIDs for session IDs
      //}
    }
));

app.use(bodyParser());

app.get('/', function (req, res) {
  //var sess = req.session.cookie;
  res.send('Hello to EVENTER!');
});

app.post('/', function (req, res) {
  //var sess = req.session.cookie;
  res.send('Hello to post!');
});

app.put('/', function (req, res) {
  //var sess = req.session.cookie;
  res.send('Hello to put!');
});

app.get('/showid', function(req,res){
  log.info("Request handler 'showid' was called");
  if(req.session.authorized) {
    log.info(req.session.user_id);
    res.writeHead(200, {"Content-Type": "Text/plain"});
    res.write("Current user session ID :" + req.session.user_id + ". Authorized : " + req.session.authorized);
    res.end();
  }
  else  {
    res.writeHead(403, {"Content-Type": "Text/plain"});
    res.write("U are not logged. Authorized : " + req.session.authorized);
    res.end();
  }
});

app.get('/login',function(request,response){
  response.render('login.ejs', { message: 'loginMessage' });
  //response.render('login.ejs', { message: request.flash('loginMessage') });
});

app.post('/login',function(request,response){
  log.info("Request handler 'login' was called.");
  if(request.session.authorized){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("U are already logged :) U can use network.");
    response.end();
  }
  else {
    //var parsedUrl = url.parse(request.url, true); // true to get query as object
    //var queryAsObject = parsedUrl.query;
    for (var obj in request.body) {
      log.info("Body req: " + obj);
    }
    var login_user = {
      email: request.body['email'],
      password: request.body['password']
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('SELECT user_id from users where email ="' + login_user.email + '" AND password = "' + login_user.password + '"',
        function (err, rows, fields) {
          log.info(query.sql);
          //response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            if (rows.length === 1) {
              log.info("User ID : " + rows[0].user_id);
              request.session.user_id = rows[0].user_id;
              request.session.authorized = true;
              // request.session.cookie.originalMaxAge = 5;
              //request.session.cookie._expires = 7 * 24 * 3600 * 1000;
              //request.session.cookie.originalMaxAge = 29;
              //var hour = 3600000;
              //request.session.cookie.expires = new Date(Date.now() + hour);
              //request.session.cookie.originalMaxAge = 29;

              log.info("LOGGED");
              response.writeHead(200, {"Content-Type": "application/json"});
              response.write(JSON.stringify(rows));
              log.info(JSON.stringify(rows));
            }
            else {
              response.writeHead(200, {"Content-Type": "Text/plain"});
              response.write("Incorrect login params");
              log.error("Incorrect login");
            }
          }
          else {
            log.error(err);
            response.writeHead(200, {"Content-Type": "Text/plain"});
            response.write("Error while performing Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
});

app.get('/info',function(request,response){
  if(request.session.authorized) {
    log.info("Request handler 'myinfo' was called.");
    var schema = 'name, surname, birth, vk_profile, email, sex, description';
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    connection.query('SELECT ' + schema + ' FROM users WHERE user_id =' +
          //queryAsObject['user_id'],
        request.session.user_id,
        function (err, rows, fields) {
          log.info("Request handler 'user_id' was called.");
          if (!err) {
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
            response.end();
          } else {
            response.writeHead(200, {"Content-Type": "Text/plain"});
            response.write('Query error');
            response.end();
            log.error('Error while performing Query.' + err);
          }
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/logout', function (request, response) {
  if (request.session.authorized) {
    request.session.authorized = false;
    response.send('Please, return!');
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/join',function(request, response) {
  if(request.session.authorized) {
    log.info("Request handler 'create user' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var new_user = {
      name: queryAsObject['name'],
      surname: queryAsObject['surname'],
      birth: queryAsObject['birth'],
      password: queryAsObject['password'],
      vk_profile: queryAsObject['vk_profile'],
      email: queryAsObject['email'],
      sex: queryAsObject['sex'],
      description: queryAsObject['description']
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('INSERT INTO users SET ?', new_user,
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/new_event',function (request, response){
  if(request.session.authorized) {
    log.info("Request handler 'create event' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var new_event = {
      //owner_id    :queryAsObject['owner_id'],
      owner_id: request.session.user_id,
      name: queryAsObject['name'],
      description: queryAsObject['description'],
      place: queryAsObject['place'],
      date: queryAsObject['date'],
      starting: queryAsObject['starting'],
      ending: queryAsObject['ending'],
      geo: queryAsObject['geo']
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('INSERT INTO events SET ?', new_event,
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/follow',function follow_user(request, response){
  if(request.session.authorized) {
    log.info("Request handler 'follow user' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var new_follower = {
      user_id: queryAsObject['user_id'],
      follower_id: request.session.user_id
      //follower_id :queryAsObject['follower_id']//HERE MUST BE CURRENT SESSION USER ID
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('INSERT INTO followers SET ?', new_follower,
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/followers',function my_followers(request, response){
  if(request.session.authorized) {
    log.info("Request handler 'my followers' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('select name,surname, birth,vk_profile,email,sex,description from users '+
        'inner join followers on users.user_id = followers.follower_id WHERE followers.user_id = '
          //+ queryAsObject['user_id'],
        + request.session.user_id,
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/followed',function i_followed(request, response){
  if(request.session.authorized) {
    log.info("Request handler 'i followed' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    /*
     select name,surname, birth,vk_profile,email,sex,description from users
     inner join followers
     on users.user_id = followers.user_id
     WHERE followers.follower_id =
     */
    var query = connection.query('select name,surname, birth,vk_profile,email,sex,description from users ' +
        'inner join followers on users.user_id = followers.user_id WHERE followers.follower_id = '
        + request.session.user_id,
        //+ queryAsObject['user_id'],
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/events',function my_events(request, response){
  if(request.session.authorized) {
    log.info("Request handler 'my events' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }

    var connection = mysql.createConnection(options.mysql_options);
    // connection.connect();

    /*select users.name as username,events.name as event_Name, events.description, events.date,
     events.place,events.starting,events.ending, events.geo from users
     inner join events
     on users.user_id = events.owner_id
     WHERE user_id = '1'
     */
    var query = connection.query('select events.name, events.description,' +
        ' events.date,events.place,events.starting,events.ending, events.geo from users' +
        ' inner join events on users.user_id = events.owner_id WHERE user_id = '
        + request.session.user_id,
//      + queryAsObject['user_id'],
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/intends',function my_intends(request, response){
  if(request.session.authorized) {
    log.info("Request handler 'my intends' was called.");
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    /*
     select name, description, place, date, events.starting, ending, geo from events
     inner join intends
     on events.event_id = intends.event_id
     WHERE intends.user_id =
     */
    var query = connection.query('select name, description, place, date, events.starting, ending, geo from events ' +
        'inner join intends on events.event_id = intends.event_id WHERE intends.user_id = '
        + request.session.user_id,
        //+ queryAsObject['user_id'],
        function (err, rows, fields) {
          log.info(query.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        });
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/go_to_event',function go_to_event(request,response){
  if(request.session.authorized) {
    log.info("Request handler for go_to_event is called");
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    for (var concrette_query in queryAsObject) {
      log.info("Query..." + concrette_query);
    }
    var new_intention = {
      user_id: request.session.user_id,
      //user_id :queryAsObject['user_id'],
      event_id: queryAsObject['event_id']
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var mysqlquery = connection.query('INSERT INTO intends SET?', new_intention,
        function (err, rows, fields) {
          log.info(mysqlquery.sql);
          response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err);
            response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
          }
          response.end();
        }
    );
    connection.end();
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});

app.get('/description',function description(request,response){
  if(request.session.authorized) {
    log.info("Request handler for description is called");
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    for (var concrette_query in queryAsObject) {
      log.info("Query... " + concrette_query);
    }

    var user_new = {};
    if (queryAsObject['name']) {
      user_new["name"] = queryAsObject['name'];
    };
    if (queryAsObject['surname']) {
      user_new["surname"] = queryAsObject['surname'];
    };
    if (queryAsObject['birth']) {
      user_new["birth"] = queryAsObject['birth'];
    };
    if (queryAsObject['vk_profile']) {
      user_new["vk_profile"] = queryAsObject['vk_profile'];
    };
    if (queryAsObject['sex']) {
      user_new["sex"] = queryAsObject['sex'];
    };
    if (queryAsObject['description']) {
      user_new["description"] = queryAsObject['description'];
    };

    if (!user_new["name"] && !user_new["surname"] && !user_new["birth"] && !user_new["vk_profile"] && !user_new["sex"] && !user_new["description"]) { // no user parameters is query
      log.error("Empty query!");
      response.write("Empty query!");
      response.end();
    }
    else {
      var connection = mysql.createConnection(options.mysql_options);
      //connection.connect();
      var mysqlQuery = connection.query('UPDATE users SET? WHERE user_id=' +
          request.session.user_id, user_new,
          function (err, rows, fields) {
            log.info(mysqlQuery.sql);
            response.writeHead(200, {"Content-Type": "application/json"});
            if (!err) {
              response.write(JSON.stringify(rows));
              log.info(JSON.stringify(rows));
            }
            else {
              log.error(err);
              response.write("Error while perfoming Query.");
              log.error('Error while performing Query.');
            }
            response.end();
          }
      );
      connection.end();
    }
  }
  else  {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
  }
});


//app.use(session(sess));

var server = app.listen(config.get('serverPort'),config.get('serverHost'), function () {
  var host = server.address().address;
  var port = server.address().port;
  log.info('Eventer server listening at http://%s:%s', host, port);
});