var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (request, response) {
  response.send('Todo API root')
})

app.get('/todos', middleware.requireAuthentication, function (request, response) {
  var query = request.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === "true") {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === "false") {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function(todos) {
    response.json(todos);
  }, function (error) {
    response.status(500).send();
  });
})

app.get('/todos/:id', middleware.requireAuthentication, function (request, response) {
  var todoId = parseInt(request.params.id, 10);

  db.todo.findById(todoId).then(function(todo) {
    if (!!todo) {
      response.json(todo.toJSON())
    } else {
      response.staus(404).send();
    }
  }, function(error) {
    response.staus(500).send(error);
  })
});

// Delete Todos
app.delete('/todos/:id', middleware.requireAuthentication, function (request, response) {
  var todoId = parseInt(request.params.id, 10);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(rowsDeleted) {
      if (rowsDeleted === 0) {
        response.status(404).json({
          error: "No todo with id"
        });
      } else {
        response.status(204).send();
      }
    }, function () {
      response.status(500).send();
    })
  });


app.post('/todos', middleware.requireAuthentication, function (request, response) {
  var body = _.pick(request.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {
    response.json(todo.toJSON());
  }, function(error) {
    response.status(400).send(error);
  });
});

// Update Todo
app.put('/todos/:id', middleware.requireAuthentication, function (request, response) {
  var todoId = parseInt(request.params.id, 10);
  var body = _.pick(request.body, 'description', 'completed');
  var attributes = {};


  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(todoId).then(function(todo) {
    if (todo) {
      todo.update(attributes).then(function (todo) {
          response.json(todo.toJSON());
        }, function (error) {
          response.status(400).json(error);
        })
    } else {
      response.status(404).send();
    }
  }, function () {
    response.status(500).send();
  })
});

app.post('/users', function (request, response) {
  var body = _.pick(request.body, 'email', 'password');

  db.user.create(body).then(function (user) {
    response.json(user.toPublicJSON())
  }, function (error) {
    response.status(400).json(error);
  });
})

// POST /users/login
app.post('/users/login', function (request, response) {
  var body = _.pick(request.body, 'email', 'password');

  db.user.authenticate(body).then(function (user) {
    var token = user.generateToken('authentication');

    if (token) {
      response.header('Auth', token).json(user.toPublicJSON());
    } else {
      response.status(401).send();
    }
  }, function () {
    response.status(401).send();
  });
});

db.sequelize.sync({force:true}).then(function() {
  app.listen(PORT, function () {
    console.log("Express listening on port: " + PORT)
  });
});
