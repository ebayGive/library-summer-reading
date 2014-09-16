var Prize = function () {

  this.defineProperties({
    userType: {type: 'string', required: true}, 
    prize1: {type: 'string', required: false},
    prize2: {type: 'string', required: false},
    prize3: {type: 'string', required: false},
    prize4: {type: 'string', required: false},
    prize5: {type: 'string', required: false},
    prize6: {type: 'string', required: false}
  });
  /* prize6 for prize for reading battery */
  this.validatesPresent('userType', {message: 'User Type is required'})
};

Prize = geddy.model.register('Prize', Prize);
