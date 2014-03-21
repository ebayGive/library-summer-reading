var CreateUsers = function () {
  this.up = function (next) {
    var def = function (t) {
          t.column('firstName', 'string');
          t.column('lastName', 'string');
          t.column('userType', 'string');
          t.column('channalRegistered', 'string');
          t.column('grids', 'object');
          t.column('prizeReceived', 'object');
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('user', def, callback);
  };

  this.down = function (next) {
    var callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.dropTable('user', callback);
  };
};

exports.CreateUsers = CreateUsers;
