var Grid = function () {

  this.defineProperties({
    userType: {type: 'string', required: true},
    cells: {type: 'object'}
  });
  
  this.validatesLength('userType', {max: 100, message: 'User Type either empty or exceeds length'});
  this.validatesWithFunction('cells', function (s) {
      return true;
  });
};

/*
// Can also define them on the prototype
Grid.prototype.someOtherMethod = function () {
  // Do some other stuff
};
// Can also define static methods and properties
Grid.someStaticMethod = function () {
  // Do some other stuff
};
Grid.someStaticProperty = 'YYZ';
*/

Grid = geddy.model.register('Grid', Grid);
