var assert = require('assert')
  , tests
  , UserType = geddy.model.UserType;

tests = {

  'after': function (next) {
    // cleanup DB
    UserType.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var usertype = UserType.create({});
    usertype.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
