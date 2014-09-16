var assert = require('assert')
  , tests
  , GridIcon = geddy.model.GridIcon;

tests = {

  'after': function (next) {
    // cleanup DB
    GridIcon.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var gridicon = GridIcon.create({});
    gridicon.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
