var assert = require('assert')
  , tests
  , Grid = geddy.model.Grid;

tests = {

  'after': function (next) {
    // cleanup DB
    Grid.remove({}, function (err, data) {
      if (err) { throw err; }
      next();
    });
  }

, 'simple test if the model saves without a error': function (next) {
    var grid = Grid.create({});
    grid.save(function (err, data) {
      assert.equal(err, null);
      next();
    });
  }

, 'test stub, replace with your own passing test': function () {
    assert.equal(true, false);
  }

};

module.exports = tests;
