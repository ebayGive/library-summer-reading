var assert = require('assert')
  , tests
  , Branch = geddy.model.Branch;

tests = {

  'after': function (next) {
    // cleanup DB
    Branch.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var branch = Branch.create({});
    branch.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
