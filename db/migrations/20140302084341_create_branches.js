var CreateBranches = function () {
  this.up = function (next) {
    var def = function (t) {
          t.column('name', 'string');
          t.column('location', 'string');
          t.column('hoursOfOperation', 'string');
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('branch', def, callback);
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
    this.dropTable('branch', callback);
  };
};

exports.CreateBranches = CreateBranches;
