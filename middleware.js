module.exports = function (db) {

  return {
    requireAuthentication: function (request, response, next) {
      var token = request.get('Auth');

      db.user.findByToken(token).then(function (user) {
        request.user = user;
        next();
      }, function () {
        response.status(401).send();
      });
    }
  };

}
