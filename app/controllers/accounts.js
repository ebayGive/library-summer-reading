var AuthenticationHelper = require('../helpers/authentication_helper');
var AuthorizationHelper = require('../helpers/authorization_helper');

var Accounts = function () {
  this.respondsWith = ['html', 'json'];
  
  this.index = function (req, resp, params) {
    var self = this;
    
    var criteria = getCriteria(params);
    if(hasFilters(criteria)) {
        addAdditionalFilterIfNeeded(self, criteria);
        geddy.model.Account.all(criteria, {sort: 'accountName', skip: 0, limit: 100}, function(err, accounts) {
          if (err) {
            self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
          }
          self.respondTo({
            html: function() {
                if(accounts.length >= 100) {
                  self.flash.alert('There could be more than 100 accounts matching your criteria. Add more search critera to filter your results.');
                }else if(accounts.length == 0) {
                  self.flash.info('No Accounts found for given criteria.');
                }
                self.flash.discard();
                geddy.model.Branch.all({},{sort: 'name'},function(err, branches) {
                if (err) {
                  self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                }
                geddy.model.UserType.all({},{sort: 'minAge'},function(err, userTypes) {
                  if (err) {
                      self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                  }
                  self.respond({accounts: accounts, branches: branches, userTypes: userTypes, roles: getRoles()});
                });
              });
            },
            json: function() {
               self.respondWith(accounts, {type:'Account'});
            }
          });
        });
    }
    else {
      self.respondTo({
        html: function() {
            geddy.model.Branch.all({},{sort: 'name'},function(err, branches) {
              if (err) {
                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              geddy.model.UserType.all(function(err, userTypes) {
              if (err) {
                  self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              self.respond({accounts: [], branches: branches, userTypes: userTypes, roles: getRoles()});
            });
          });
        },
        json: function() {
           self.respondWith([], {type:'Account'});
        }
      });
    }
  };

    this.pickWinners = function (req, resp, params) {
        var self = this;
        console.log(params);
        var criteria = getPickWinnerCriteria(params);
        var winners = {};
        if(hasFilters(criteria)) {
            addAdditionalFilterIfNeeded(self, criteria);
            geddy.model.Account.all(criteria, {sort: 'accountName'}, function(err, accounts) {
                if (err) {
                    self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                }
                self.respondTo({
                    html: function() {


                        //pick random winners from the account list
                        if(typeof params['userTypeId'] != 'undefined') {
                            var usersEligibleForPrize = buildUsersEligibleForPrize(accounts, params['userTypeId'].trim());
                        }

                        //pick random winners from the usersEligibleForPrize  list
                        var winnersSize = 5;
                        if(params['choice']) {
                            winnersSize = params['choice'].trim();
                        }

                        winners = getRandomUsers(usersEligibleForPrize,winnersSize);
                        self.flash.discard();
                        geddy.model.Branch.all({},{sort: 'name'},function(err, branches) {
                            if (err) {
                                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                            }
                            geddy.model.UserType.all({},{sort: 'minAge'},function(err, userTypes) {
                                if (err) {
                                    self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                                }
                                self.respond({winners: winners, branches: branches, userTypes: userTypes, roles: getRoles()});
                            });
                        });
                    },
                    json: function() {
                        self.respondWith(winners, {type:'Winner'});
                    }
                });
            });
        }
        else {
            self.respondTo({
                html: function() {
                    geddy.model.Branch.all({},{sort: 'name'},function(err, branches) {
                        if (err) {
                            self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                        }
                        geddy.model.UserType.all(function(err, userTypes) {
                            if (err) {
                                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                            }
                            self.respond({winners: [], branches: branches, userTypes: userTypes, roles: getRoles()});
                        });
                    });
                },
                json: function() {
                    self.respondWith([], {type:'Account'});
                }
            });
        }
    };


    this.add = function (req, resp, params) {
    var self = this;
      geddy.model.Branch.all({},{sort: 'name'}, function(err, branches) {
      if (err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      geddy.model.UserType.all({},{sort: 'minAge'}, function(err, userTypes) {
        if (err) {
          self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
        }
        self.respond({params: params, branches: branches, userTypes: userTypes, roles: getRoles()});
      });
    });
  };

  this.register = function (req, resp, params) {
    var self = this;
      geddy.model.Branch.all({},{sort: 'name'}, function(err, branches) {
      if (err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      geddy.model.UserType.all({},{sort: 'minAge'}, function(err, userTypes) {
        if (err) {
          self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
        }
        self.respond({params: params, branches: branches, userTypes: userTypes, roles: getRoles()});
      });
    });
  };

  this.create = function (req, resp, params) {
    var self = this
      , account = geddy.model.Account.create(params);

    if (!account.isValid()) {
      self.respondWith(account);
    }
    else {
      account.save(function(err, data) {
        if (err) {
          self.respondWith(getUserFriendlyErrorMessage( err, self ) );
        }
        if(self.session.get('account_info') && self.session.get('account_info').role != 'READER') {
          self.respondWith(account);
        }
        else {
          self.authenticateAccount(params, function(err, account1, authToken){
          if(err) {
            self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
          }
          if(!account) {
            self.respondWith(new geddy.errors.NotFoundError());
          }else {
              self.respondTo({
                html: function(){
                  self.respond({authToken: authToken, account: account});
                },
                json: function() {
                  self.respond({authToken: authToken, account: account});
                }
              });
          }
          });
        }
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Account.first(params.id, function(err, account) {
      if (err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if (!account) {
        self.respondWith(new geddy.errors.NotFoundError());
      }
      else {
          self.respondTo({
            html: function() {
                geddy.model.Branch.all(function(err, branches) {
                    if (err) {
                      self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                    }
                    geddy.model.UserType.all(function(err, userTypes) {
                    if (err) {
                      self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                    }
                    self.respond({account: account, branches: branches, userTypes: userTypes, roles: getRoles()});
                 });
              });
            },
            json: function() {
               self.respondWith(account);
            }
          });
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Account.first(params.id, function(err, account) {
      if (err) {
         self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if (!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          self.respondTo({
            html: function() {
                geddy.model.Branch.all({},{sort: 'name'}, function(err, branches) {
                    if (err) {
                      self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                    }
                    geddy.model.UserType.all({},{sort: 'minAge'}, function(err, userTypes) {
                    if (err) {
                        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                    }
                    self.respond({account: account, branches: branches, userTypes: userTypes, roles: getRoles()});
                 });
              });
            },
            json: function() {
               self.respondWith(account);
            }
          });
      }
    });
  };
  
  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Account.first(params.id, function(err, account) {
      if (err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      account.updateProperties(params);

      if (!account.isValid()) {
        self.respondWith(account);
      }
      else {
        account.save(function(err, data) {
          if (err) {
            self.respondWith( getUserFriendlyErrorMessage( err, self ) );
          }
          self.respondWith(account);
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.Account.first(params.id, function(err, account) {
      if (err) {
          self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if (!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
        geddy.model.Account.remove(params.id, function(err) {
          if (err) {
            self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
          }
          self.respondWith(account);
          logUserForAction(self.session, self.params);
        });
      }
    });
  };

  this.editUsers = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
        self.respondTo({
          html: function(){
                geddy.model.Branch.all(function(err, branches) {
                    if (err) {
                      self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                    }
                    geddy.model.UserType.all(function(err, userTypes) {
                    if (err) {
                      self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                    }
                    geddy.model.Badge.all({}, {sort: 'bdgId'}, function(err, badges){
                      if (err) {
                        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                      }
                      self.respond({account: account, branches: branches, userTypes: userTypes, badges: badges, roles: getRoles()});
                    });
                 });
              });
          },
          json: function() {
               self.respondWith(account);
          }
        })
      }
    });
  }

  this.showUser = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          var user = account.getUser(params['userId']);
          if(!user){
            self.respondWith(new geddy.errors.BadRequestError());
          }
          else {
              geddy.model.Grid.first({userType: user.userType}, function(err, grid) {
                  if (err) {
                    self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                  }
                  geddy.model.Prize.first({userType: user.userType}, function(err, prize) {
                  if (err) {
                    self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
                  }
                  self.respondTo({
                    html: function(){
                         self.respond({user: user, grid: grid, prize: prize});
                    },
                    json: function() {
                         self.respond({user: user, grid: grid, prize: prize});
                    }
                  });
               });
            });
          }
      }
    });
  }

  this.addUser = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          account.addUser(params);
    
          if (!account.isValid()) {
            self.respondWith(account);
          }
          else {
            account.save(function(err, data) {
              if (err) {
                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              self.respondTo({
                html: function(){
                     self.respond({user: account.users[account.users.length-1]});
                },
                json: function() {
                     self.respond({user: account.users[account.users.length-1]});
                }
              });
            });
          }
      }
    });
  }

  this.updateUser = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          account.updateUser(params);
    
          if (!account.isValid()) {
            self.respondWith(account);
          }
          else {
            account.save(function(err, data) {
              if (err) {
                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              self.respondTo({
                html: function(){
                     self.respond({user: account.getUser(params['userId'])});
                },
                json: function() {
                     self.respond({user: account.getUser(params['userId'])});
                }
              });
            });
          }
      }
    });
  }
  
  this.showUserActivityGridCell = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          var cell = account.getUserActivityGridCell(params['userId'], params['cellIndex']);
          if(!cell){
            self.respondWith(new geddy.errors.BadRequestError());
          }
          else {
            self.respondTo({
              html: function(){
                   self.respond({id: params.id, userId: params['userId'], cellIndex: params['cellIndex'], activityGridCell: cell});
              },
              json: function() {
                   self.respond({id: params.id, userId: params['userId'], cellIndex: params['cellIndex'], activityGridCell: cell});
              }
            });
          }
        }
    });
  }

  this.updateUserActivityGridCell = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          account.updateUserActivityGridCell(params);
    
          if (!account.isValid()) {
            self.respondWith(account);
          }
          else {
            account.save(function(err, data) {
              if (err) {
                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              self.respondTo({
                html: function(){
                   self.respond({id: params.id, userId: params['userId'], cellIndex: params['cellIndex'], 
                   activityGridCell: account.getUserActivityGridCell(params['userId'], params['cellIndex']),
				   prizes: account.getUser(params['userId']).prizes});
                },
                json: function() {
                   self.respond({id: params.id, userId: params['userId'], cellIndex: params['cellIndex'], 
                   activityGridCell: account.getUserActivityGridCell(params['userId'], params['cellIndex']),
				   prizes: account.getUser(params['userId']).prizes});
                }
              });
            });
          }
        }
    });
  };

  this.showUserPrize = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          var prize = account.getUserPrize(params['userId'], params['prizeIndex']);
          if(!prize){
            self.respondWith(new geddy.errors.BadRequestError());
          }
          else {
            self.respondTo({
              html: function(){
                   self.respond({id: params.id, userId: params['userId'], prizeIndex: params['prizeIndex'], prize: prize});
              },
              json: function() {
                   self.respond({id: params.id, userId: params['userId'], prizeIndex: params['prizeIndex'], prize: prize});
              }
            });
          }
        }
    });
  }

  this.updateUserPrize = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          account.updateUserPrize(params);
    
          if (!account.isValid()) {
            self.respondWith(account);
          }
          else {
            account.save(function(err, data) {
              if (err) {
                self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              self.respondTo({
                html: function(){
                   self.respond({id: params.id, userId: params['userId'], cellIndex: params['prizeIndex'], activityGridCell: account.getUserPrize(params['userId'], params['prizeIndex'])});
                },
                json: function() {
                   self.respond({id: params.id, userId: params['userId'], cellIndex: params['prizeIndex'], activityGridCell: account.getUserPrize(params['userId'], params['prizeIndex'])});
                }
              });
            });
          }
        }
    });
  };
  
  this.showUserReadingLog = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          var readingLog = account.getUserReadingLog(params['userId']);
          self.respondTo({
            html: function(){
                 self.respond({id: params.id, userId: params['userId'], readingLog: readingLog});
            },
            json: function() {
                 self.respond({id: params.id, userId: params['userId'], readingLog: readingLog});
            }
          });
        }
    });
  }

  this.updateUserReadingLog = function(req, resp, params) {
    var self = this;
    
    geddy.model.Account.first(params.id, function(err, account){
      if(err) {
        self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
      }
      if(!account) {
        self.respondWith(new geddy.errors.BadRequestError());
      }
      else {
          account.updateUserReadingLog(params);
    
          if (!account.isValid()) {
            self.respondWith(account);
          }
          else {
            account.save(function(err, data) {
              if (err) {
                  self.respondWith(  getUserFriendlyErrorMessage( err, self ) );
              }
              self.respondTo({
                html: function(){
                   self.respond({id: params.id, userId: params['userId'], readingLog: account.getUserReadingLog(params['userId'])});
                },
                json: function() {
                   self.respond({id: params.id, userId: params['userId'], readingLog: account.getUserReadingLog(params['userId'])});
                }
              });
            });
          }
        }
    });
  };
  
  this.signin = function(req, resp, params) {
    var self = this;
     self.respond({params: params});
  };

  this.authenticateAccount = function(params, callbackFn) {
    var self = this;
    var authParams = {accountName: params['accountName'], passcode: params['passcode'], applicationId: '12112'};
    var authnHelper = new AuthenticationHelper();
    authnHelper.authenticate(authParams, function(err, account, authToken){
      if(!err && account){
         self.session.set('account_info', {authToken: authToken, id: account.id, role: account.role});
      }
      callbackFn(err, account, authToken);
      return;
    });
  };
  
  this.authenticate = function(req, resp, params) {
    var self = this;
    var authParams = {accountName: params['accountName'], passcode: params['passcode'], applicationId: '12112'};
    var authnHelper = new AuthenticationHelper();
    authnHelper.authenticate(authParams, function(err, account, authToken){
        if(err){
            self.flash.error(err.message);
            self.redirect('/');
            return;
        }
        self.respondTo({
          html: function() {
            self.session.set('account_info', {authToken: authToken, id: account.id, role: account.role});
            if(account.role == "READER") {
              self.redirect(account.id + '/edit_users');
            }
            else {
              self.redirect({controller: 'accounts', action: 'index'});
            }
          },
          json: function() {
             self.respond({authToken: authToken, account: account});
          }
        });
    });
  };

  this.signout = function(req, resp, params) {
    this.session.set('account_info', null);
    this.redirect('/');
  };

};

exports.Accounts = Accounts;

var getCriteria = function(params) {
    var criteria = {};
    if(typeof params['accountName'] != "undefined" && params['accountName'].trim().length > 0) {
      criteria['accountName'] = params['accountName'].trim().toLowerCase();
    }
    if(typeof params['emailAddress'] != "undefined" && params['emailAddress'].trim().length > 0) {
      criteria['emailAddress'] = params['emailAddress'].trim().toLowerCase();
    }
    if(typeof params['firstName'] != "undefined" && params['firstName'].trim().length > 0) {
      criteria['users'] = {$elemMatch: {firstName: new RegExp(params['firstName'].trim(), 'i')}};
    }
    if(typeof params['lastName'] != "undefined" && params['lastName'].trim().length > 0) {
      criteria['users'] = {$elemMatch: {lastName: new RegExp(params['lastName'].trim(), 'i')}};
    }
    if(typeof params['branchId'] != "undefined" && params['branchId'].trim().length > 0) {
      criteria['branchId'] = params['branchId'].trim();
    }
    if(typeof params['phone'] != "undefined" && params['phone'].trim().length > 0) {
      criteria['phone'] = params['phone'].trim();
    }
    return criteria;
}

var getPickWinnerCriteria = function(params) {
    var criteria = {};

    if(typeof params['branchId'] != "undefined" && params['branchId'].length > 0) {
        branches = params['branchId'];
        criteria['branchId'] = branches;
        //pick winners with role = READER
        criteria['role'] = 'READER';
    }


    return criteria;
}


var  buildUsersEligibleForPrize=  function(accounts,userTypeId) {
    var m = accounts.length, t, i;

    var users =[];


    for (var index = 0; index < accounts.length; ++index) {
        if(typeof accounts[index].users != 'undefined' && accounts[index].users.length > 0) {
            for (var index2 = 0; index2 < accounts[index].users.length; index2++) {
                // add user only if the usertypeID is matched.
                if(typeof accounts[index].users[index2].userType != 'undefined'  && accounts[index].users[index2].userType === userTypeId )
                {
                    if(hasUserCompletedActivityGrid(accounts[index].users[index2])) {
                        var user = {};
                        user.accountId = accounts[index].id;
                        user.accountName = accounts[index].accountName;
                        user.firstName = accounts[index].users[index2].firstName;
                        user.lastName = accounts[index].users[index2].lastName;
                        user.userType = accounts[index].users[index2].userType;
                        user.phone = accounts[index].phone;
                        user.emailAddress = accounts[index].emailAddress;
                        //add to users list
                        users.push(user);
                    }
                }
            }

        }
    }

    return users;

}

var hasUserCompletedActivityGrid = function(user) {

    if(user != 'undefined' && user.prizes != 'undefined' && user.prizes.length > 0 && user.prizes[1].state > 0){
        return true;
    }
    
    return false;
}



var getRandomUsers = function(users,winnersSize) {
    var m = users.length, t, i;
    // While there remain elements to shuffle
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = users[m];
        users[m] = users[i];
        users[i] = t;
    }
    return users.slice(0,winnersSize);
}


var hasFilters = function(criteria) {
    for(var filter in criteria) {
      if(criteria.hasOwnProperty(filter)) {
        return true;
      }
    }
    return false;
}

var addAdditionalFilterIfNeeded = function(self, criteria) {
  if(!isAdmin(self.session)) {
    criteria['role'] = {$ne: 'ADMIN'} 
  }
}