var assert = require('assert')
  , tests
  , Library = geddy.model.Library;

tests = {

  'after': function (next) {
    // cleanup DB
    Library.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var library = Library.create({});
    library.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
