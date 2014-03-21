var CreateUserTypes = function () {
  this.up = function (next) {
    var def = function (t) {
          t.column('name', 'string');
          t.column('description', 'string');
          t.column('minAge', 'int');
          t.column('maxAge', 'int');
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('userType', def, callback);
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
    this.dropTable('userType', callback);
  };
};

exports.CreateUserTypes = CreateUserTypes;
