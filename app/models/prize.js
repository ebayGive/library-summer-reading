var Prize = function () {

  this.defineProperties({
    userType: {type: 'string', required: true}, 
    prizeType: {type: 'string', required: true},
    description: {type: 'string', required: false}
  });

  this.validatesPresent('userType', {message: 'User Type is required'})
  this.validatesPresent('prizeType', {message: 'Prize Type is required'})
  this.validatesLength('userType', {max: 100, message: 'User Type exceeds length'});
  this.validatesLength('prizeType', {max: 100, message: 'Prize Type exceeds length'});
};

Prize = geddy.model.register('Prize', Prize);
