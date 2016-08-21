var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (request, response) {
  response.send('Todo API root')
})

app.get('/todos', function (request, response) {
  var queryParams = request.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filteredTodos = _.where(filteredTodos, { completed: true });
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where(filteredTodos, { completed: false });
  }

  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    filteredTodos = _.filter(filteredTodos, function (todo) {
      return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    });
  }

  response.json(filteredTodos);
})

app.get('/todos/:id', function (request, response) {
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
app.delete('/todos/:id', function (request, response) {
  var todoId = parseInt(request.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (!matchedTodo) {
    response.status(404).json({"error": "No todo found with that ID."});
  } else {
    todos = _.without(todos, matchedTodo);
    response.json(matchedTodo);
  }
});

app.post('/todos', function (request, response) {
  var body = _.pick(request.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {
    response.json(todo.toJSON());
  }, function(error) {
    response.status(400).send(error);
  });
});

// Update Todo
app.put('/todos/:id', function (request, response) {
  var todoId = parseInt(request.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(request.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    return response.status(404).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return response.status(400).send();
  };

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return response.status(400).send();
  };

  _.extend(matchedTodo, validAttributes);
  response.json(matchedTodo)
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function () {
    console.log("Express listening on port: " + PORT)
  });
});
