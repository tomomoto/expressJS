var express = require('express'),
    app = express(),
    mysql = require('mysql'),
    url = require('url'),
    session = require('express-session'),
    SessionStore = require('express-mysql-session'),
    config = require('config'),
    log = require('libs/log')(module),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon');

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

app.use(favicon(__dirname + '\\favicon.ico'));

app.use("/scripts", express.static(__dirname + '/scripts'));

app.use(session({
      secret            : 'i_do_not_know_but_it_is_needed',
      name              : 'eventer_nyam_nyam',
      store             : mysql_session_storage,
      resave            : true,
      saveUninitialized : false,
      user_id           : 0,
      authorized        : false,
      cookie: {
        //httpOnly: false,
        secure  : false
      }
      //,
      //genid             : function(req) {
      // return genuuid() // use UUIDs for session IDs
      //}
    }));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (request, response) {
  response.redirect('/login');
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
  log.info("Req.handl get[login] was called.");
  if(request.session.authorized)
    response.redirect('/id'+request.session.user_id);
  else
    response.render('login.ejs', {message: '',user_id:0});
  //response.render('login.ejs', { message: request.flash('loginMessage') });
});

app.post('/login',function(request,response){
  log.info("Req.handl post[login] was called.");
  if(request.session.authorized){
    /*
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("U are already logged :) U can use network.");
    response.end();
    */
    response.redirect('/');
  }
  else {
    //var parsedUrl = url.parse(request.url, true); // true to get query as object
    //var queryAsObject = parsedUrl.query;
    var login_user = {
      email: request.body['email'],
      password: request.body['password']
    };
    if(request.body['password'] && request.body['email']) {
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
                request.session.cookie.originalMaxAge = 365 * 24 * 3600 * 1000;
                //request.session.cookie.originalMaxAge = 29;
                //var hour = 3600000;
                //request.session.cookie.expires = new Date(Date.now() + hour);
                //request.session.cookie.originalMaxAge = 29;

                log.info("LOGGED" + JSON.stringify(rows));
                //response.writeHead(200, {"Content-Type": "application/json"});
                //response.write(JSON.stringify(rows));
                //log.info(JSON.stringify(rows));
                response.redirect('/id'+request.session.user_id);
              }
              else {
                //response.writeHead(200, {"Content-Type": "Text/plain"});
                //response.write("Incorrect login params");
                log.error("Incorrect parameters.");
                //response.end();
                response.render('login.ejs', {message: 'Incorrect parameters.', user_id: ''});
              }
            }
            else {
              log.error(err);
              //response.writeHead(200, {"Content-Type": "Text/plain"});
              //response.write("Error while performing Query.");
              log.error('Error while performing Query.');
              //response.render('login.ejs',{message:'Incorrect parameters.'});
              //response.end();
            }
            //response.end();
          });
      connection.end();
    }
    else
      response.render('login.ejs',{message:'Fill query parameters.',user_id:0});
    //response.redirect('/info');
    //response.render('edit.ejs',{description:'lalka',message:''});
  }
});

app.get('/edit',function(request,response){
  log.info("Req.handl get[info] was called.");
  if(request.session.authorized) {
    var schema = 'name, surname, birth, vk_profile, email, sex, description';
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    connection.query('SELECT ' + schema + ' FROM users WHERE user_id =' +
          //queryAsObject['user_id'],
        request.session.user_id,
        function (err, rows, fields) {
          log.info("Req.handl get[info] was called.");
          if (!err) {
            //response.writeHead(200, {"Content-Type": "application/json"});
            //response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
            var birth;
            if(rows[0].birth) birth = rows[0].birth.toLocaleDateString();
            //log.info(rows[0].birth.toLocaleDateString());
            response.render('edit.ejs',
                {name:rows[0].name,
                  surname:rows[0].surname,
                  birth:birth,
                  vk_profile:rows[0].vk_profile,
                  email:rows[0].email,
                  sex:rows[0].sex,
                  description:rows[0].description,
                  message:'',
                  user_id:request.session.user_id.toString()
                });
            //response.end();
          } else {
            //response.writeHead(200, {"Content-Type": "Text/plain"});
            //response.write('Query error');
            //response.end();
            log.error('Error while performing Query.' + err.toString());
            response.render('login',{message:'тут какая то лажа, хз как попал сюда.'});
          }
        });
    connection.end();
  }
  else  {
    /*
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();*/
    log.debug("ber");
    response.redirect('login');
  }
});

app.get('/logout', function (request, response) {
  if (request.session.authorized) {
    request.session.authorized = false;
    response.redirect('/');
    //response.send('Please, return!');
  }
  else  {
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.render('login.ejs',{message:'You are not logged!',user_id:0});
  }
});

app.get('/join',function(request, response) {
  if (request.session.authorized)
    //response.render('edit.ejs',{message:'You are already logged. Try logout -> join',user_id:request.session.user_id});
    response.redirect('/');
  else
    response.render('join.ejs', {message: '',user_id:0 });
});

app.post('/join',function(request, response) {
  log.info("Request handler 'create user' was called.");
  if(!request.session.authorized) {
    var parsedUrl = url.parse(request.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;
    for (var obj in queryAsObject) {
      log.info("Query: " + obj);
    }
    var new_user = {
      //name: queryAsObject['name'],
      //surname: queryAsObject['surname'],
      //birth: queryAsObject['birth'],
      password: request.body['password'],
      //vk_profile: queryAsObject['vk_profile'],
      email: request.body['email'],
      //sex: queryAsObject['sex'],
      //description: queryAsObject['description']
    };
    if(request.body['password'] && request.body['email'])
    {
      var connection = mysql.createConnection(options.mysql_options);
      var query = connection.query('INSERT INTO users SET ?', new_user,
          function (err, rows, fields) {
            log.info(query.sql);
            //response.writeHead(200, {"Content-Type": "application/json"});
            if (!err) {
              //response.write(JSON.stringify(rows));
              log.info(JSON.stringify(rows));
              response.redirect('/login');
            }
            else {
              //log.error(err);
              //response.write("Error while perfoming Query.");
              response.render('join.ejs', {message: 'Login used... Or something else.', user_id:0});
              log.error('Error while performing Query.');
            }
            //response.end();
          });
      connection.end();
    }
    else
      response.render('join.ejs',{message:'Fill query parameters.',user_id:0});
  }
  else  {
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
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
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
  }
});

app.post('/follow',function follow_user(request, response){
  if(request.session.authorized) {
    log.info("Request handler 'follow user' was called.");
    //var parsedUrl = url.parse(request.url, true); // true to get query as object
    //var queryAsObject = parsedUrl.query;
    //for (var obj in queryAsObject) {
    //  log.info("Query: " + obj);
    //}
    var new_follower = {
      user_id: request.body['user_id'],
      follower_id: request.session.user_id,
      reject_repeatable:'id'+request.session.user_id+'id'+request.body['user_id']
      //follower_id :queryAsObject['follower_id']//HERE MUST BE CURRENT SESSION USER ID
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('INSERT INTO followers SET ?', new_follower,
        function (err, rows, fields) {
          log.info(query.sql);
          //response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            log.info(JSON.stringify(rows));
            response.send(true);
            //response.write(JSON.stringify(rows));
          }
          else {
            log.error('Error while performing Query.'+err.toString());
            response.send("Error while perfoming Query.");
            //log.error(err);
          }
          //response.end();
        });
    connection.end();
  }
  else  {
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
  }
});

app.delete('/follow',function follow_user(request, response){
  log.info("Request handler delete[follow] was called.");
  if(request.session.authorized) {
    //var parsedUrl = url.parse(request.url, true); // true to get query as object
    //var queryAsObject = parsedUrl.query;
    //for (var obj in queryAsObject) {
    //  log.info("Query: " + obj);
    //}
    var delete_follower = {
      user_id: request.body['user_id'],
      follower_id: request.session.user_id,
      reject_repeatable:'id'+request.session.user_id+'id'+request.body['user_id']
      //follower_id :queryAsObject['follower_id']//HERE MUST BE CURRENT SESSION USER ID
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('delete from followers where user_id ='+delete_follower.user_id+' AND follower_id =' +request.session.user_id,
        function (err, rows, fields) {
          log.info(query.sql);
          //response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            log.info(JSON.stringify(rows));
            //response.write(rows);
            response.send(true);
          }
          else {
            log.error('Error while performing Query.'+err.toString());
            response.send("Error while perfoming Query.");
            //log.error(err);
          }
          response.end();
        });
    connection.end();
  }
  else  {
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
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
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
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
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
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
    var query = connection.query('select events.event_id, events.name, events.description,' +
        ' events.date,events.place,events.starting,events.ending, events.geo from users' +
        ' inner join events on users.user_id = events.owner_id WHERE user_id = '
        + request.session.user_id+' ORDER by events.created DESC limit 5',
//      + queryAsObject['user_id'],
        function (err, rows, fields) {
          log.info(query.sql);
          //response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            response.render('events.ejs',{message:'',user_id:request.session.user_id.toString(),events:rows});
            //response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
          }
          else {
            log.error(err.toString());
            response.render('events.ejs',{message:'Query error...',user_id:request.session.user_id.toString()});
            //response.write("Error while perfoming Query.");
          }
          //response.end();
        });
    connection.end();
  }
  /*else {
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorizedo : " + request.session.authorized);
    response.end();
  }*/
  else {
    log.info("Req.handl get[events] was called.");
    response.render('login.ejs', {message: 'Restricted.',user_id:0});
  }
});

app.delete('/event',function (request, response){
  log.info("Request handler delete[event] was called.");
  if(request.session.authorized) {
    //var parsedUrl = url.parse(request.url, true); // true to get query as object
    //var queryAsObject = parsedUrl.query;

    var delete_event = {
      event_id: request.body['event_id'],
      owner_id: request.session.user_id
    };
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('delete from events where event_id ='+delete_event.event_id+' AND owner_id =' +request.session.user_id,
        function (err, rows, fields) {
          log.info(query.sql);
          //response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            log.info(JSON.stringify(rows));
            //response.write(rows);
            response.send(true);
          }
          else {
            log.error('Error while performing Query.'+err.toString());
            response.send("Error while perfoming Query.");
            //log.error(err);
          }
          response.end();
        });
    connection.end();
  }
  else  {
    //response.writeHead(200, {"Content-Type": "Text/plain"});
    //response.write("U are not logged. Authorized : " + request.session.authorized);
    //response.end();
    response.redirect('/');
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
  log.info("Req. handl get['/description']");
  if(request.session.authorized)
    response.render('description.ejs', {message: '',user_id:request.session.user_id.toString()});
  else
    response.render('login.ejs',{message: 'Mister! U are not logged!',user_id:0});
});

app.post('/description',function description(request,response){
  if(request.session.authorized) {
    log.info("Req. handl post['/description']");
    //var parsedUrl = url.parse(request.url, true);
    //var queryAsObject = parsedUrl.query;
    for (var element in request.body) {
      log.info("Query... " + element);
    }

    var user_new = {};
    //if (request.body['name'])
      user_new["name"] = request.body['name'];
    //if (request.body['surname'])
      user_new["surname"] = request.body['surname'];
    if (!request.body['birth'])
      user_new["birth"] = null;
    else
      user_new["birth"] = request.body['birth'];
    //if (request.body['vk_profile'])
      user_new["vk_profile"] = request.body['vk_profile'];
   // if (request.body['sex'])
      user_new["sex"] = request.body['sex'];
    //if (request.body['description'])
      user_new["description"] = request.body['description'];

    if (!user_new["name"] && !user_new["surname"] && !user_new["birth"] && !user_new["vk_profile"] && !user_new["sex"] && !user_new["description"]) { // no user parameters is query
      log.error("Empty query!");
      response.render('description.ejs',{message:'Empty req.',user_id:request.session.user_id});
      return;
      //response.write("Empty query!");
      //response.end();
    }
    else {
      var connection = mysql.createConnection(options.mysql_options);
      //connection.connect();
      var mysqlQuery = connection.query('UPDATE users SET? WHERE user_id=' +
          request.session.user_id, user_new,
          function (err, rows, fields) {
            log.info(mysqlQuery.sql);
            //response.writeHead(200, {"Content-Type": "application/json"});
            if (!err) {
              //response.write(JSON.stringify(rows));
              log.info(JSON.stringify(rows));
              response.redirect('/id'+request.session.user_id);
            }
            else {
              //response.write("Error while perfoming Query.");
              log.error('Error while performing Query. '+err.toString());
              response.redirect('/edit');
              //response.render('edit.ejs',{message:'something fked.',user_id:request.session.user_id});
            }
            //response.end();
          }
      );
      connection.end();
    }
  }
  else  {
    /*
    response.writeHead(200, {"Content-Type": "Text/plain"});
    response.write("U are not logged. Authorized : " + request.session.authorized);
    response.end();
    */
    response.render('login.ejs',{message: 'Mister! U are not logged!'});
  }
});

app.get('/newEvent',function (request, response){
  log.info("Req. handl get['/new_event']");
  if(request.session.authorized)
    response.render('newEvent.ejs', {message: '',user_id:request.session.user_id.toString()});
  else
    response.render('login.ejs',{message: 'Mister! U are not logged!',user_id:0});
});

app.post('/newEvent',function (request, response){
  log.info("Req. handl post['/new_event']");
  if(request.session.authorized) {
    var user_event = {};
    user_event["owner_id"] = request.session.user_id;
    user_event["name"] = request.body['name'];
    user_event["description"] = request.body['description'];
    if (!request.body['date'])
      user_event["date"] = null;
    else
      user_event["date"] = request.body['date'];
    user_event["place"] = request.body['place'];
    user_event["starting"] = request.body['starting'];
    user_event["ending"] = request.body['ending'];
    user_event["geo"] = request.body['geolocation'];
    if (!user_event["name"] && !user_event["description"] && !user_event["date"] && !user_event["place"] && !user_event["starting"] && !user_event["ending"] && !user_event["geo"]) { // no user parameters is query
      log.error("Empty query!");
      response.render('newEvent.ejs',{message:'Empty request.',user_id:request.session.user_id});
      //response.write("Empty query!");
      return;
    }
    var connection = mysql.createConnection(options.mysql_options);
    //connection.connect();
    var query = connection.query('INSERT INTO events SET ?', user_event,
        function (err, rows, fields) {
          log.info(query.sql);
          //response.writeHead(200, {"Content-Type": "application/json"});
          if (!err) {
            //response.write(JSON.stringify(rows));
            log.info(JSON.stringify(rows));
            response.redirect('/events');
          }
          else {
            log.error(err.toString());
            //response.write("Error while perfoming Query.");
            log.error('Error while performing Query.');
            response.render('newEvent.ejs',{message:err.toString(),user_id:request.session.user_id});
          }
          //response.end();
        });
    connection.end();
  }
  else  {
    response.redirect('/login');
  }
});

app.get(/^\/id(\d+)/, function(request, response){
  //response.send(request.params[0]);
  log.info("Req.handl get[id"+request.params[0]+']'+"was called.");
  if (request.session.authorized == true) {
    var schema = 'user_id, name, surname, birth, vk_profile, email, sex, description';
      var connection = mysql.createConnection(options.mysql_options);
      connection.query('SELECT ' + schema + ' FROM users WHERE user_id =' + request.params[0],
          function (profileErr, profileRows, fields) {
            if (!profileErr && profileRows.length) {
              var connection2 = mysql.createConnection(options.mysql_options);
              var query2 = connection2.query('select events.event_id, events.name, events.description,' +
                  ' events.date,events.place,events.starting,events.ending, events.geo from users' +
                  ' inner join events on users.user_id = events.owner_id WHERE user_id = ' + request.params[0]+' ORDER by events.created DESC limit 5',
                  function (eventsErr, eventRows, fields) {
                    log.info(query2.sql);
                    if (!eventsErr) {
                      if (request.session.user_id == request.params[0]) {
                        response.render('MyProfile.ejs',{message:'',user_id:request.session.user_id.toString(),profile:profileRows[0],events:eventRows});
                      }
                      else {
                        //select * from followers where follower_id=1 and user_id = 16
                        var connection3 = mysql.createConnection(options.mysql_options);
                        var query3 = connection3.query('select * from followers where follower_id='+request.session.user_id+' and user_id = '+request.params[0],
                            function (followErr, followRow, fields) {
                              log.info(query3.sql);
                              if (!eventsErr) {
                                response.render('notMyProfile.ejs',{message:'',user_id:request.session.user_id.toString(),profile:profileRows[0],events:eventRows,follower:followRow});
                              }
                            });
                      }
                    }
                    else {
                      log.error("Something broken..."+eventsErr.toString());
                      response.redirect('/');
                    }
                  });
              connection2.end();
            }
            else {
              if(profileRows.length==0){
                log.error('User not found. ');
                response.render('pageNotFound.ejs',{user_id:request.session.user_id});
              }
              if(profileErr){
                log.error(profileErr.toString());
              }
              //log.error('User not found.or errors');
              //response.redirect('/');
            }
          });
      connection.end();
    }
  else
    //response.render('notMyProfile.ejs',{message:'',user_id:'',profile:profileRows[0],events:eventRows});
  response.render('login.ejs',{message:'U are not logged.',user_id:0});
});

app.get('/getAjaxUserEvent',function (request, response){
  log.info("Req. handl get['/getAjaxUserEvent']");
  if(request.session.authorized) {
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    var requestParameters = {
      user_id: request.session.user_id,
      offset: queryAsObject['offset'],
      owner: queryAsObject['owner'],
      limit:queryAsObject['limit']
    };
    if (requestParameters.offset && requestParameters.owner && requestParameters.limit) {
      var connection = mysql.createConnection(options.mysql_options);
      var query = connection.query('SELECT * FROM events where owner_id=' + requestParameters.owner + ' order by created desc limit ' + requestParameters.offset + ', ' + requestParameters.limit,
          function (err, rows, fields) {
            log.info(query.sql);
            if (!err) {
              response.send(rows);
            }
            else {
              log.error('Error while performing Query.' + err.toString());
              response.redirect('/');
            }
          });
      connection.end();
    }
    else{
      log.error("Wrong parameters in getAjaxEvent handler");
      response.send("Wrong Parameters.");
    }
  }
  else
    response.redirect('/');
});

app.get('/getAjaxUserFollowers',function (request, response){
  log.info("Req. handl get['/getAjaxUserFollowers']");
  if(request.session.authorized) {
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    var requestParameters = {
      offset: queryAsObject['offset'],
      owner: queryAsObject['owner'],
      limit:queryAsObject['limit']
    };
    if (requestParameters.offset && requestParameters.owner && requestParameters.limit) {
      var connection = mysql.createConnection(options.mysql_options);
      var query = connection.query('select users.user_id, name, surname, birth, vk_profile, email, sex,description from users '+
          'inner join followers on users.user_id = followers.follower_id WHERE followers.user_id = '
          + requestParameters.owner + ' order by created desc limit ' + requestParameters.offset + ', ' + requestParameters.limit,
          function (err, rows, fields) {
            log.info(query.sql);
            if (!err) {
              log.info(JSON.stringify(rows));
              //response.writeHead(200, {"Content-Type": "application/json"});
              response.send(rows);
            }
            else {
              log.error('Error while performing Query. '+err.toString());
              response.send("Error while perfoming Query.");
            }
            //response.end();
          });
      connection.end();
    }
    else{
      log.error("Wrong parameters in getAjaxUserFollowers handler");
      response.send("Wrong Parameters.");
    }
  }
  else
    response.redirect('/');
});

app.get('/getAjaxUserFollowed',function (request, response){
  log.info("Req. handl get['/getAjaxUserFollowed']");
  if(request.session.authorized) {
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    var requestParameters = {
      offset: queryAsObject['offset'],
      owner: queryAsObject['owner'],
      limit:queryAsObject['limit']
    };
    if (requestParameters.offset && requestParameters.owner && requestParameters.limit) {
      var connection = mysql.createConnection(options.mysql_options);
      var query = connection.query('select users.user_id, name, surname, birth, vk_profile, email, sex,description from users '+
          'inner join followers on users.user_id = followers.user_id WHERE followers.follower_id = '
          + requestParameters.owner + ' order by created desc limit ' + requestParameters.offset + ', ' + requestParameters.limit,
          function (err, rows, fields) {
            log.info(query.sql);
            if (!err) {
              log.info(JSON.stringify(rows));
              //response.writeHead(200, {"Content-Type": "application/json"});
              response.send(rows);
            }
            else {
              log.error('Error while performing Query. '+err.toString());
              response.send("Error while perfoming Query.");
            }
            //response.end();
          });
      connection.end();
    }
    else{
      log.error("Wrong parameters in getAjaxUserFollowers handler");
      response.send("Wrong Parameters.");
    }
  }
  else
    response.redirect('/');
});

var server = app.listen(config.get('serverPort'),config.get('serverHost'), function () {
  var host = server.address().address;
  var port = server.address().port;
  log.info('Eventer server listening at http://%s:%s', host, port);
});