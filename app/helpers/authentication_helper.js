var crypto = require('crypto');

function AuthenticationHelper() {
    var self = this;
    this.authenticate = function(authParams, callbackFn) {
        if(!validateAuthParams(authParams)) {
          callbackFn(new Error('Account Name and Passcode are required'));
          return;
        }
        geddy.model.Account.first({accountName: authParams['accountName'].trim().toLowerCase()}, function(err, account) {
          if (err) {
              callbackFn(err);
              return;
          }
          if (!account) {
            callbackFn(new Error('Account Name or Passcode not valid'));
            return;
          }
          else {
              if(!account.validatePasscode(authParams['passcode'])){
                    callbackFn(new Error('Account Name or Passcode not valid'));
               }
               else {
                   self.getTokenByAccountAndApplicationId(authParams['accountName'], authParams['applicationId'], function(err, authToken){
                       callbackFn(err, account, authToken);
                   });
               }
            }
        });
    };
    
    validateAuthParams = function(authParams) {
        if(typeof authParams['accountName'] === "undefined" || authParams['accountName'].trim().length == 0) {
          return false;
        }
        if(typeof authParams['passcode'] === "undefined" || authParams['passcode'].trim().length == 0) {
          return false;
        }
        if(typeof authParams['applicationId'] === "undefined" || authParams['applicationId'].trim().length == 0) {
          return false;
        }
        return true;
    };

    
    this.getTokenByAccountAndApplicationId = function(accountId, applicationId, callbackFn) {
        geddy.model.AccountAuthToken.first({accountId: accountId, applicationId: applicationId}, function(err, accountAuthToken) {
          if (err) {
            callbackFn(err);
            return;
          }
          if (!accountAuthToken || accountAuthToken.expiresAt.getTime() < Date.now()) {
              // get token  
                var authToken = crypto.randomBytes(128).toString('base64'),
                    authTokenParams = {accountId: accountId, applicationId: applicationId, authToken: authToken},
                    accountAuthToken = geddy.model.AccountAuthToken.create(authTokenParams);
                
                if (!accountAuthToken.isValid()) {
                    callbackFn(new Error('Failed to generate auth token'));
                }
                else {
                  accountAuthToken.save(function(err, data) {
                    if (err) {
                        callbackFn(new Error('Failed to generate auth token'));
                        return;
                    }
                     callbackFn(err, accountAuthToken.authToken);
                  });
                }
          }else {
            callbackFn(err, accountAuthToken.authToken);
          }
        });
     };

    this.getAccountIdByAuthTokenAndApplicationId = function(authToken, applicationId, callbackFn) {
        geddy.model.AccountAuthToken.first({authToken: authToken, applicationId: applicationId}, function(err, accountAuthToken) {
          if (err) {
            callbackFn(err);
            return;
          }
          if (!accountAuthToken) {
            callbackFn(geddy.errors.NotFoundError());
            return;
          }
          if(accountAuthToken.expiresAt.getTime() < Date.now()) {
            callbackFn(geddy.errors.NotFoundError());
            return;
          }
          callbackFn(err, accountAuthToken.accountId);
        });
     };
};

module.exports = AuthenticationHelper;
