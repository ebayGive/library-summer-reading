var uuid = require('node-uuid');
var crypto = require('crypto');

var iterations = 1000;
var keylen = 32; // bytes
var Account = function () {

  this.defineProperties({
        accountName: {type:'string', required: true},
        emailAddress: {type: 'string', required: false},
        branchId: {type: 'string', required: true},
        role: {type: 'string', required: true},
        passcode: {type: 'string', required: true},
        salt: {type: 'string', required: false},
        users: {type: 'object'},
  });

  this.validatesPresent('accountName', {message: 'Account Name is required, preferably phone number'});
  this.validatesPresent('branchId', {message: 'Branch is required'});
  this.validatesPresent('role', {message: 'Role is required'});
  this.validatesPresent('passcode', {message: 'Passcode is required'});
  this.validatesLength('accountName', {max: 20});
  this.validatesWithFunction('branchId', function (branchId) {
      return branchId != "-1";
  }, {message: 'Branch is required'});
  this.validatesWithFunction('role', function (role) {
      return role != "-1";
  }, {message: 'Role is required'});
  
  this.validatesWithFunction('emailAddress', function (emailAddress) {
    if(typeof emailAddress === 'undefined' || emailAddress == "") {
      return true;
    }
    return /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/.test(emailAddress);
  }, {message: 'Email Address is not valid'});
  
  // Validate Mandatory Fields
  this.validatesWithFunction('users', function (users) {
    if(typeof users === 'undefined' || users.length == 0) {
      return true;
    }
    var user;
    for(var iUr in users) {
      user = users[iUr];
      if(typeof user.firstName === 'undefined' || user.firstName.trim().length == 0) {
        return false;
      }
      if(typeof user.lastName === 'undefined' || user.lastName.trim().length == 0) {
        return false;
      }
      if(typeof user.userType === 'undefined' || user.userType == "-1" || user.userType.length == 0) {
        return false;
      }
      if(typeof user.age != 'undefined' && user.age != null && isNaN(user.age)) { // Last minute reg. Dont want to add another validateFunction
        return false;
      }
    }
    for(var iUr1 in users) {
      for(var iUr2 in users) {
        if(iUr2 != iUr1) {
          if(users[iUr2].firstName == users[iUr1].firstName && users[iUr2].lastName == users[iUr1].lastName) {
            return false;
          }
        }
      }
    }
    return true;
  }, {message: 'Something wrong with Family Member details'});

  this.addUser = function(params) {
    if(typeof this.users != 'undefined') {
      if(typeof params['user'] != 'undefined') {
         params['user']['id'] = -1;
         this.users[this.users.length] = params['user'];
      }else {
        var user = {}
        user['id'] = -1;
        user['firstName'] = (typeof params['firstName'] === 'undefined' ? '' : params['firstName']);
        user['lastName'] = (typeof params['lastName'] === 'undefined' ? '' : params['lastName']);
        user['userType'] = (typeof params['userType'] === 'undefined' ? '' : params['userType']);
        user['age'] = (typeof params['age'] === 'undefined' ? '' : params['age']);
        this.users[this.users.length] = user;
      }
    }
  }

  this.updateUser = function(params) {
    if(typeof params['userId'] != 'undefined' && typeof this.users != 'undefined') {
      for(iUr in this.users) {
        if(this.users[iUr].id == params['user']['id']) {
          this.users[iUr] = params['user'];
          break;
        }
      }
    }
  }
  
  this.getUser = function(userId) {
    if(typeof userId != 'undefined' && typeof this.users != 'undefined') {
      for(iUr in this.users) {
        if(this.users[iUr].id == userId) {
          return this.users[iUr];
        }
      }
    }
    return null;
  }
  
  this.getUserActivityGridCell = function(userId, cellIndexP) {
    var cellIndex = parseInt(cellIndexP);
    if(isNaN(cellIndex)){
      return null;
    }
    if(typeof userId != 'undefined' && typeof this.users != 'undefined') {
      for(var iUr in this.users) {
        if(this.users[iUr].id == userId) {
          if(this.users[iUr].activityGrid && this.users[iUr].activityGrid.length > cellIndex) {
            return this.users[iUr].activityGrid[cellIndex];
          }
          return null;
        }
      }
    }
    return null;
  }

  this.updateUserActivityGridCell = function(params) {
    var cellIndex = parseInt(params['cellIndex']);
    var userId = params['userId'];
    var updatedAt = new Date();
    if(typeof params['updatedAt'] != 'undefined') {
      if(isNaN(params['updatedAt'])) {
        updatedAt = new Date(params['updatedAt']);
      }
      else{
        updatedAt = new Date(parseInt(params['updatedAt']));
      }
    }
    if(typeof userId != 'undefined' && typeof this.users != 'undefined') {
      for(var iUr in this.users) {
        if(this.users[iUr].id == userId) {
          if(this.users[iUr].activityGrid && this.users[iUr].activityGrid.length > cellIndex) {
            if(this.users[iUr].activityGrid[cellIndex].activity == 0 || 
              typeof this.users[iUr].activityGrid[cellIndex].updatedAt === 'undefined' || 
              (new Date(this.users[iUr].activityGrid[cellIndex].updatedAt)) < updatedAt) {
              if(params['activity'] != 'undefined') {
                this.users[iUr].activityGrid[cellIndex].activity = parseInt(params['activity']);
              }
              if(params['notes'] != 'undefined') {
                this.users[iUr].activityGrid[cellIndex].notes = params['notes'];
              }
              this.users[iUr].activityGrid[cellIndex].updatedAt = updatedAt;
            }
          }
          break;
        }
      }
    }
  }

  this.getUserPrize = function(userId, prizeIndexP) {
    var prizeIndex = parseInt(prizeIndexP);
    if(isNaN(prizeIndex)){
      return null;
    }
    if(typeof userId != 'undefined' && typeof this.users != 'undefined') {
      for(var iUr in this.users) {
        if(this.users[iUr].id == userId) {
          if(this.users[iUr].prizes && this.users[iUr].prizes.length > prizeIndex) {
            return this.users[iUr].prizes[prizeIndex];
          }
          return null;
        }
      }
    }
    return null;
  }

  this.updateUserPrize = function(params) {
    var prizeIndex = parseInt(params['prizeIndex']);
    var userId = params['userId'];
    var updatedAt = new Date();
    if(typeof params['updatedAt'] != 'undefined') {
      updatedAt = new Date(params['updatedAt']);
    }
    if(typeof userId != 'undefined' && typeof this.users != 'undefined') {
      for(var iUr in this.users) {
        if(this.users[iUr].id == userId) {
          if(this.users[iUr].prizes) {
            if(this.users[iUr].prizes.length <= prizeIndex || typeof this.users[iUr].prizes[prizeIndex].updatedAt === 'undefined' || typeof this.users[iUr].prizes[prizeIndex].updatedAt < updatedAt) {
              if(params['state'] != 'undefined') {
                this.users[iUr].prizes[prizeIndex].state = parseInt(params['state']);
              }
              if(params['notes'] != 'undefined') {
                this.users[iUr].prizes[prizeIndex].notes = params['notes'];
              }
              this.users[iUr].prizes[prizeIndex].updatedAt = updatedAt;
            }
          }
          break;
        }
      }
    }
  }
  
  this.getUserReadingLog = function(userId){
    if(typeof userId != 'undefined' && typeof this.users != 'undefined') {
      for(var iUr in this.users) {
          if(this.users[iUr].id == userId) {
            return this.users[iUr].readingLog;
          }
       }
     }
     return null;
   }
  
  this.updateUserReadingLog = function(params){
    var userId = params['userId'];
    var readingLog = params['readingLog'];
    if(typeof userId != 'undefined' && typeof this.users != 'undefined' && typeof readingLog != 'undefined') {
      for(var iUr in this.users) {
          if(this.users[iUr].id == userId) {
            this.users[iUr].readingLog = parseInt(readingLog);
            break;
          }
        }
      }
   }
  
  this.validatePasscode = function(passcode) {
    var hashedPasscode;
    if(this.salt) {
      var saltBuff = new Buffer(this.salt, 'base64');
      var hashedPasscodeBuff = crypto.pbkdf2Sync(passcode, saltBuff, iterations, keylen);
      hashedPasscode = hashedPasscodeBuff.toString('base64');
    }
    else {
      hashedPasscode = passcode;
    }
    return (this.passcode == hashedPasscode);
  }
};

Account = geddy.model.register('Account', Account);

Account.on('beforeSave', function(data){
    hashPasscode (data);
    setUserIdForNewUsers(data);
    setDefaultUserData(data);
    setPrizeState(data);
  });

Account.on('beforeUpdate', function(data){
    hashPasscode (data);
    setUserIdForNewUsers(data);
    setDefaultUserData(data);
    setPrizeState(data);
  });

Account.on('beforeCreate', function(params){
      updateRole(params);
 });

Account.on('beforeUpdateProperties', function(data, params){
      updatePasscode(data, params);
      // Update Role just prevent fraudsters to overwrite role to claim admin previlige
      params.role = data.role;
      if(typeof data.users != 'undefined') {
          for(var iUser=0; iUser < data.users.length; iUser++) {
              for(iUserP = 0; iUserP < params.users.length; iUserP++) {
                  if(params.users[iUserP]["id"] == data.users[iUser]["id"]) {
                    syncupUser(data.users[iUser], params.users[iUserP]);
                  }
              }
           }
       }
 });
 
 var syncupUser = function (dataUser, paramUser) {
    if(typeof paramUser.firstName === 'undefined') {
      paramUser.firstName = dataUser.firstName;
    }  
    if(typeof paramUser.lastName === 'undefined') {
      paramUser.lastName = dataUser.lastName;
    }  
    if(typeof paramUser.userType === 'undefined') {
      paramUser.userType = dataUser.userType;
    }  
    if(typeof paramUser.activityGrid === 'undefined') {
      paramUser.activityGrid = dataUser.activityGrid;
    }  
    if(typeof paramUser.prizes === 'undefined') {
      paramUser.prizes = dataUser.prizes;
    }  
    if(typeof paramUser.readingLog === 'undefined') {
      paramUser.readingLog = dataUser.readingLog;
    }  
 }
 
 var hashPasscode = function (data) {
   if(typeof data.salt === 'undefined' || data.salt.length == 0){
     data.salt = crypto.randomBytes(32).toString('base64');
   }
   if(data.passcode.length <= 4) {
     var saltBuff = new Buffer(data.salt, 'base64');
     var hashedPasscodeBuff = crypto.pbkdf2Sync(data.passcode, saltBuff, iterations, keylen);
     data.passcode = hashedPasscodeBuff.toString('base64');
   }
 }
 
 var updatePasscode = function(data, params) {
   if(typeof params['passcode'] === 'undefined' || params['passcode'] == '') {
     params['passcode'] = data.passcode;
   }
 }
 
 var updateRole = function (params) {
   if(typeof params['role'] === 'undefined') {
     params['role'] = 'READER';
   }
 }
 
 var setUserIdForNewUsers = function(data){
      if(typeof data.users === 'undefined') {
        data.users = [];
        return;
      }

      for(var iUser in data.users) {
          if(!isNaN(data.users[iUser]['id'])) {
            data.users[iUser]['id'] = uuid.v4();
          }
      }
  }
  
  var setDefaultUserData = function(data) {
      if(typeof data.users === 'undefined') {
        data.users = [];
        return;
      }
      var user;
      for(var iUser in data.users) {
        user = data.users[iUser];
        if(typeof user.activityGrid === 'undefined') {
            user.activityGrid = [];
            for(var iCell = 0; iCell < 25; iCell++) {
              user.activityGrid[iCell] = {activity: 0, notes: '', updatedAt: new Date()};  
            }
        }
        if(typeof user.prizes === 'undefined') {
            user.prizes = [];
            for(var iPrz = 0; iPrz < 6; iPrz++) {
              user.prizes[iPrz] = {state: 0, notes: '', updatedAt: new Date()};  
            }
        }
        if(typeof user.readingLog === 'undefined') {
          user.readingLog = 0;
        }
      }
  }
  
  var setPrizeState = function(data) {
    if(!data.users) {
      return;
    }
    for(var iUser in data.users) {
      setPrizeStateForUser(data.users[iUser]);
    }
  }
  
  var setPrizeStateForUser = function(user) {
    if(user.prizes && user.prizes.length == 5 && user.prizes[4].state > 0) {//already done all cells
      return;
    }
    var iPrizeIndex = -1;
    var completedAll = true;
    var rowDone = false;
    var colDone = false;
    var diagonal1Done = true;
    var diagonal2Done = true;
    var gridIndex = 0;
    // Check Rows
    for(var iRow=0; iRow<5; iRow++) {
      rowDone = true;
      colDone = true;
      for(var iCol=0; iCol<5; iCol++) {
        //row
        gridIndex = iRow*5+iCol;
        if(user.activityGrid.length > gridIndex) {
          if(!user.activityGrid[gridIndex].activity) {
            completedAll = false;
            rowDone = false;
          }
        }
        //col
        gridIndex = iCol*5+iRow;
        if(user.activityGrid.length > gridIndex) {
          if(!user.activityGrid[gridIndex].activity) {
            completedAll = false;
            colDone = false;
          }
        }
        if(iRow == iCol) {
          //diagonal1
          gridIndex = iRow*5+iCol;
          if(user.activityGrid.length > gridIndex) {
            if(!user.activityGrid[gridIndex].activity) {
              diagonal1Done = false;
            }
          }
          //diagonal2
          gridIndex = iRow*5+(4-iCol);
          if(user.activityGrid.length > gridIndex) {
            if(!user.activityGrid[gridIndex].activity) {
              diagonal2Done = false;
            }
          }
        }
      }
      if(rowDone) {
        iPrizeIndex++;
      }
      if(colDone) {
        iPrizeIndex++;
      }
    }
    if(diagonal1Done) {
      iPrizeIndex++;
    }
    if(diagonal2Done) {
      iPrizeIndex++;
    }
    for(var iPrz=0; iPrz<4; iPrz++) {
      if(iPrz > iPrizeIndex) {
        break;
      }
      if(!user.prizes[iPrz].state) {
        user.prizes[iPrz].state = 1;
      }
    }
    if(iPrizeIndex >= 4 && completedAll && !user.prizes[iPrz].state) {
        user.prizes[4].state = 1;
    }
  };
  
exports.Account = Account;
