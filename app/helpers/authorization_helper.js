var AuthenticationHelper = require('../helpers/authentication_helper');

var actionsNotRequiredAuth = {'Main': ['index'], 
                              'Accounts': ['signin', 'authenticate', 'signout', 'create', 'register'],
                              'Branches': ['index'],
                              'Grids': ['index'],
                              'Prizes': ['index'],
                              'Badges': ['index','create'],
                              'UserTypes': ['index'],
                              'GridIcons': ['index'],
                              'Helps': ['applicationHelp']}
                              
var actionsRequiredAuth = {'ADMIN': {'Accounts':['index', 'add', 'edit', 'update', 'show', 'remove', 'showUser', 'addUser','updateUser','editUsers','showUserActivityGridCell','updateUserActivityGridCell','showUserPrize','updateUserPrize', 'showUserReadingLog', 'updateUserReadingLog'],
                                    'Grids': ['add', 'create', 'edit', 'update', 'show', 'remove'],
                                    'Prizes': ['add', 'create', 'edit', 'update', 'show', 'remove'],
                                    'Branches': ['add', 'create', 'edit', 'update', 'show', 'remove'],
                                    'Badges': ['add', 'create', 'edit', 'update', 'show', 'remove','updateFile'],
                                    'UserTypes': ['add', 'create', 'edit', 'update', 'show', 'remove'],
                                    'GridIcons': ['add', 'create', 'edit', 'update', 'show', 'remove'],
									'Reports': ['index']},
	                       'VOLUNTEER': {'Accounts':['index', 'add', 'edit', 'update', 'show', 'remove', 'showUser', 'addUser','updateUser','editUsers','showUserActivityGridCell','updateUserActivityGridCell','showUserPrize','updateUserPrize', 'showUserReadingLog', 'updateUserReadingLog'],
									   'Reports': ['index']},
                           'READER': {'Accounts': ['add', 'edit', 'update', 'show', 'showUser', 'addUser','updateUser','editUsers','showUserActivityGridCell','updateUserActivityGridCell','showUserPrize','updateUserPrize', 'showUserReadingLog', 'updateUserReadingLog']}
                        };

function AuthorizationHelper() {
	 this.authNotRequired = function(controller, action) {
          var actions = actionsNotRequiredAuth[controller];
          if(actions) {
                var acts = actions.length;
                while(acts--) {
                   if(actions[acts] == action) {
                       return true;
                   }
                }
          }
          return false;
     }
     
     this.isActionAllowed = function(role, controller, action) {
          var controllers = actionsRequiredAuth[role];
          if(controllers) {
                actions = controllers[controller];
                if(actions) {
                      var acts = actions.length;
                      while(acts--) {
                         if(actions[acts] == action) {
                             return true;
                         }
                      }
                }
          }
          return false;
     }
     
    this.validateSession = function(authToken, authParams, callbackFn) {
        if(authParams) {
	        if(typeof authParams['id'] === "undefined" || authParams['id'].trim().length == 0) {
			  callbackFn(new Error('Sign In required'));
			  return;
			}
			geddy.model.Account.first(authParams['id'], function(err, account) {
				  if (err) {
					  callbackFn(err, account);
					  return;
				  }
				  if (!account) {
					callbackFn(new Error('Sign In required'));
					return;
				  }
	  			  callbackFn(err, account);
			});
		}
        else if(authToken) {
			  self.checkAuthTokenExpiry(authToken, function(err, accountAuthToken) {
				  if (err) {
						callbackFn(err, account);
						return;
				  }
				  
				  if (!accountAuthToken) {
					callbackFn(new Error('Auth token is invalid, please signin again'), account);
					return;
				  }
				  else {
					    geddy.model.Account.first({accountName: accountAuthToken.accountId}, function(err, account) {
							  if (err) {
								  callbackFn(new Error('Unable to retrieve Account'), account);
								  return;
							  }
							  
							  if (!account) {
								callbackFn(new Error('Unable to retrieve Account'), account);
								return;
							  }
							  else {
								 callbackFn(err, account);
							  }
						});		  
				  }
			  });
		}
        else {
          //callbackFn(new Error('Sign In required')); //Uncomment once mobile starts passing token
          var err, account;
          callbackFn(err, account);
          return;
        }
    };
	
	this.checkAuthTokenExpiry = function(authToken, callbackFn) 
	{
        geddy.model.AccountAuthToken.first({authToken: authToken}, function(err, accountAuthToken) 
		{
			  if (err) {
					callbackFn(err, accountAuthToken);
					return;
			  }
			  
			  if (!accountAuthToken) {
					callbackFn(new Error('Auth token is invalid, please login again'), accountAuthToken);
					return;
			  }
			  else if (accountAuthToken.expiresAt.getTime() < Date.now()) {
					callbackFn(new Error('Auth token is expired, please login again'), accountAuthToken);
					return;
			  }
			  callbackFn(err, accountAuthToken);
		});
     };

     this.throwError = function(caller, role, err) {
	       caller.respondTo({
	         	html: function() {
	         			caller.flash.error(err.message);
                        if(!role) {
      	         			caller.redirect('/');
                        }
                        else if(role == 'ADMIN' || role == 'VOLUNTEER') {
      	         			caller.redirect({controller: 'accounts', action: 'index'});
                        }
                        else {
                            if(caller.session &&  caller.session.get('account_info')) {
                                 caller.redirect('/accounts/' + caller.session.get('account_info').id + '/edit_users'); 
                            }
      	         			else{
      	         			     caller.redirect('/');
      	         			}
                        }
	   			},
	   			json: function() {
	   					caller.respondWith(err);
	   			}
	   	   });
     };
};

module.exports = AuthorizationHelper;
