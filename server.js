var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [
  {
    id: 1,
    description: "Meet mom for lunch",
    completed: false
  }, {
    id: 2,
    description: "Go to hockey game",
    completed: false
  }, {
    id: 3,
    description: "Study for MakerSquare interview",
    completed: true
  }
]

app.get('/', function (request, response) {
  response.send('Todo API root')
})

app.get('/todos', function (request, response) {
  response.json(todos);
})

app.get('/todos/:id', function (request, response) {
  var todoId = parseInt(request.params.id, 10);
  var matchedTodo;

  todos.forEach(function(todo) {
    if (todo.id === todoId) {
      matchedTodo = todo;
    }
  })

  if (matchedTodo) {
    response.json(matchedTodo);
  } else {
    response.status(404).send();
  }
})

app.listen(PORT, function () {
  console.log("Express listening on port: " + PORT)
})
