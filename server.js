var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (request, response) {
  response.send('Todo API root')
})

app.get('/todos', function (request, response) {
  response.json(todos);
})

app.get('/todos/:id', function (request, response) {
  var todoId = parseInt(request.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    response.json(matchedTodo);
  } else {
    response.status(404).send();
  }
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

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return response.status(400).send();
  }

  body.description = body.description.trim();

  body.id = todoNextId++;

  todos.push(body);

  response.json(body);
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
})

app.listen(PORT, function () {
  console.log("Express listening on port: " + PORT)
})
