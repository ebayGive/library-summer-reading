var Badge = function () {

  this.defineProperties({
    bdgId: {type: 'int', required: true},
    desc: {type: 'string', required: true},
    imageSrc: {type: 'string', required: true}
  });

  this.validatesPresent('bdgId', {message: 'Id is required'});
  this.validatesPresent('desc', {message: 'Description is required'});
  this.validatesPresent('imageSrc',  {message: 'Description is required'});
};

Badge = geddy.model.register('Badge', Badge);
