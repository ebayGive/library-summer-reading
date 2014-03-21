var Branch = function () {

  this.defineProperties({
    name: {type: 'string'},
    location: {type: 'string'},
    hoursOfOperation: {type: 'string', required: false}
  });

  this.validatesPresent('name', {message: 'Name is required'});
  this.validatesPresent('location', {message: 'Location is required'});
  this.validatesLength('name', {max: 200});
  this.validatesLength('location', {max: 200});
};

Branch = geddy.model.register('Branch', Branch);
