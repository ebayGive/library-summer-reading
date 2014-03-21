var UserType = function () {

  this.defineProperties({
    name: {type: 'string', required: true},
    description: {type: 'string', required: false},
    minAge: {type: 'int', required: true},
    maxAge: {type: 'int', required: true}
  });

  this.validatesLength('name', {max: 100, message: 'Name exceeds length'});
  this.validatesWithFunction('minAge', function (minAge) {
      return minAge < 100;
  }, {message: 'Minimum Age is not in allowed range'});
  this.validatesWithFunction('maxAge', function (maxAge) {
      return maxAge < 130;
  }, {message: 'Maximum Age is not in allowed range'});

};

/*
// Can also define them on the prototype
UserType.prototype.someOtherMethod = function () {
  // Do some other stuff
};
// Can also define static methods and properties
UserType.someStaticMethod = function () {
  // Do some other stuff
};
UserType.someStaticProperty = 'YYZ';
*/

UserType = geddy.model.register('UserType', UserType);
