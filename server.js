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

app.listen(PORT, function () {
  console.log("Express listening on port: " + PORT)
})
