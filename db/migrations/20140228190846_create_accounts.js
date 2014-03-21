var CreateAccounts = function () {
  this.up = function (next) {
    var def = function (t) {
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('account', def, callback);
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
    this.dropTable('account', callback);
  };
};

exports.CreateAccounts = CreateAccounts;
