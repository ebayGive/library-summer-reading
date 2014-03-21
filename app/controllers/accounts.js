var Accounts = function () {
  this.respondsWith = ['html', 'json'];
  
  this.before(function(){
     var self = this;
     if(!self.session.get('account_info') || !self.session.get('account_info').access_token) {
        self.flash.error('Authentication required')
        self.redirect({controller: 'accounts', action: 'signin'})
     }
  }, {except: ['signin', 'authenticate', 'signout']});

  this.index = function (req, resp, params) {
    var self = this;
    
    var criteria = getCriteria(params);
    if(hasFilters(criteria)) {
        geddy.model.Account.all(criteria, function(err, accounts) {
          if (err) {
            throw err;
          }
          self.respondTo({
            html: function() {
                geddy.model.Branch.all(function(err, branches) {
                if (err) {
                  throw err;
                }
                geddy.model.UserType.all(function(err, userTypes) {
                  if (err) {
                      throw err;
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
            geddy.model.Branch.all(function(err, branches) {
              if (err) {
                throw err;
              }
              geddy.model.UserType.all(function(err, userTypes) {
              if (err) {
                  throw err;
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

  this.add = function (req, resp, params) {
    var self = this;
      geddy.model.Branch.all(function(err, branches) {
      if (err) {
        throw err;
      }
      geddy.model.UserType.all(function(err, userTypes) {
        if (err) {
            throw err;
        }
        self.respond({params: params, branches: branches, userTypes: userTypes, roles: getRoles()});
      });
    });
  };

  this.create = function (req, resp, params) {
    var self = this
      , account = geddy.model.Account.create(params);

    if (!account.isValid()) {
      this.respondWith(account);
    }
    else {
      account.save(function(err, data) {
        if (err) {
          throw err;
        }
        account.add
        self.respondWith(account, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Account.first(params.id, function(err, account) {
      if (err) {
        throw err;
      }
      if (!account) {
        self.respondWith(geddy.errors.NotFoundError());
      }
      else {
          self.respondTo({
            html: function() {
                geddy.model.Branch.all(function(err, branches) {
                    if (err) {
                      throw err;
                    }
                    geddy.model.UserType.all(function(err, userTypes) {
                    if (err) {
                      throw err;
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
        throw err;
      }
      if (!account) {
        throw new geddy.errors.BadRequestError();
      }
      else {
          self.respondTo({
            html: function() {
                geddy.model.Branch.all(function(err, branches) {
                    if (err) {
                      throw err;
                    }
                    geddy.model.UserType.all(function(err, userTypes) {
                    if (err) {
                      throw err;
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
        throw err;
      }
      account.updateProperties(params);

      if (!account.isValid()) {
        self.respondWith(account);
      }
      else {
        // Handle with before Update
        account.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(account, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.Account.first(params.id, function(err, account) {
      if (err) {
        throw err;
      }
      if (!account) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.Account.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(account);
        });
      }
    });
  };
  
  this.signin = function(req, resp, params) {
    var self = this;
     self.respond({params: params});
  };

  this.authenticate = function(req, resp, params) {
    var self = this;
    
    if(!self.validateAuthParams()) {
      self.flash.error('Account Name and Passcode are required')
      self.transfer('signin');
      return;
    }
    geddy.model.Account.first({accountName: params['accountName']}, function(err, account) {
      if (err) {
        throw err;
      }
      if (!account) {
        self.flash.error('Account Name or Passcode not valid')
        self.transfer('signin');
        return;
      }
      else {
          self.respondTo({
            html: function() {
              self.session.set('account_info', {access_token: account.id, role: account.role});
              if(account.role == "READER") {
                self.redirect({controller: 'accounts', action: 'show', id: account.id});
              }
              else {
                self.redirect({controller: 'accounts', action: 'index'});
              }
            },
            json: function() {
              // TODO more work needed here
               self.respondWith({access_token: account.id, role: account.role});
            }
          });
      }
    });
  };

  this.validateAuthParams = function() {
    if(typeof this.params['accountName'] === "undefined" || this.params['accountName'].trim().length == 0) {
      return false;
    }
    if(typeof this.params['passcode'] === "undefined" || this.params['passcode'].trim().length == 0) {
      return false;
    }
    return true;
  }

  this.signout = function(req, resp, params) {
    this.session.set('account_info', null);
    this.redirect('/');
  };

};

exports.Accounts = Accounts;

var getCriteria = function(params) {
    var criteria = {};
    if(typeof params['accountName'] != "undefined" && params['accountName'].trim().length > 0) {
      criteria['accountName'] = params['accountName'].trim();
    }
    if(typeof params['emailAddress'] != "undefined" && params['emailAddress'].trim().length > 0) {
      criteria['emailAddress'] = params['emailAddress'].trim();
    }
    if(typeof params['branchId'] != "undefined" && params['branchId'].trim().length > 0) {
      criteria['branchId'] = params['branchId'].trim();
    }
    return criteria;
}

var hasFilters = function(criteria) {
    for(var filter in criteria) {
      if(criteria.hasOwnProperty(filter)) {
        return true;
      }
    }
    return false;
}