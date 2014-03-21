var uuid = require('node-uuid');

var Account = function () {

  this.defineProperties({
        accountName: {type:'string', required: true},
        emailAddress: {type: 'string', required: true},
        branchId: {type: 'string', required: true},
        role: {type: 'string', required: true},
        passcode: {type: 'string', required: true},
        users: {type: 'object'},
  });

  this.validatesPresent('accountName', {message: 'Account Name is required, preferably phone number'});
  this.validatesPresent('emailAddress', {message: 'Email Address is required'});
  this.validatesPresent('branchId', {message: 'Branch is required'});
  this.validatesPresent('role', {message: 'Role is required'});
  this.validatesPresent('passcode', {message: 'Passcode is required'});
  this.validatesFormat('emailAddress', /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/, {message: 'Email Address is not valid'});
  this.validatesLength('accountName', {max: 20});
  this.validatesWithFunction('branchId', function (branchId) {
      return branchId != "-1";
  }, {message: 'Branch is required'});
  this.validatesWithFunction('role', function (role) {
      return role != "-1";
  }, {message: 'Role is required'});
  this.validatesWithFunction('users', function (users) {
      return true;
  });
};

Account = geddy.model.register('Account', Account);

Account.on('beforeSave', function(data){
    hashPasscode (data);
    setUserIdForNewUsers(data);
  });

Account.on('beforeUpdate', function(data){
    hashPasscode (data);
    setUserIdForNewUsers(data);
  });

/*Account.on('beforeUpdateProperties', function(data, params){
      hashPasscode(data, params);
      if(typeof params.users === 'undefined') {
         params.users = [];
      }
      if(typeof data.users != 'undefined') {
          for(var iUser=0; iUser < data.users.length; iUser++) {
              var userFound = false;
              var deletedUserParamIndex = -1;
              for(iUserP = 0; iUserP < params.users.length; iUserP++) {
                  if(typeof params.deletedUsers != 'undefined' && params.deletedUsers.indexOf(data.users[iUser]["id"]) > -1) {
                    deletedUserParamIndex = iUserP;
                  }
                  if(params.users[iUserP]["id"] == data.users[iUser]["id"]) {
                      userFound = true;
                      break;
                  }
              }
             if(!userFound) {
                params.users[params.users.length] = data.users[iUser];
             }
         }
       }
 });*/
 
 var hashPasscode = function (data) {
   var passcode = data.passcode;
   //hash and set
 }
 
 var setUserIdForNewUsers = function(data){
      if(typeof data.users === 'undefined') {
        data.users = [];
        return;
      }

      for(var iUser=0; data.users.length > iUser; iUser++) {
          if(!isNaN(data.users[iUser]['id'])) {
            data.users[iUser]['id'] = uuid.v4();
          }
      }
  }