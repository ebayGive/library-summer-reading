var AccountAuthToken = function () {

  this.defineProperties({
        accountId: {type:'string', required: true},
        applicationId: {type: 'string', required: true},
        authToken: {type: 'string', required: true},
        expiresAt: {type: 'date', required: false}
  });

  this.validatesPresent('accountId', {message: 'Account Id is required'});
  this.validatesPresent('applicationId', {message: 'Application Id is required'});
  this.validatesPresent('authToken', {message: 'Auth Token is required'});

};
AccountAuthToken = geddy.model.register('AccountAuthToken', AccountAuthToken);


AccountAuthToken.on('beforeSave', function(data){
      setExpiresAt(data);
  });

AccountAuthToken.on('beforeUpdate', function(data){
      setExpiresAt(data);
 });

function setExpiresAt(data){
    var expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    data.expiresAt = expiresAt;
}

exports.AccountAuthToken = AccountAuthToken;

