var assert = require('assert')
  , tests
  , Prize = geddy.model.Prize;

tests = {

  'after': function (next) {
    // cleanup DB
    Prize.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var prize = Prize.create({});
    prize.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
