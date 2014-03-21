var assert = require('assert')
  , tests
  , Account = geddy.model.Account;

tests = {

  'after': function (next) {
    // cleanup DB
    Account.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var account = Account.create({});
    account.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
