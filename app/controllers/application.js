var AuthorizationHelper = require('../helpers/authorization_helper');
/*
 * Geddy JavaScript Web development framework
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var Application = function () {
  this.before(function(){
     var authorization = new AuthorizationHelper();
     if(authorization.authNotRequired(this.params['controller'], this.params['action'])) {
         return;
     }
     var accountRole = 'READER';
     if(this.session && this.session.get('account_info') && this.session.get('account_info').role){
         accountRole = this.session.get('account_info').role;
     }
     if(!authorization.isActionAllowed(accountRole, this.params['controller'], this.params['action'])){
		 var err;
		 if(this.request.headers['auth_token'] || this.session.get('account_info')) {
	        err = new Error('Your last action is not authorized for your role (' + accountRole + ')');
		 }
		 else {
         	err = new Error('User authentication required');
		 }
         authorization.throwError(this, accountRole, err);
     }
  });

/*  this.authorize = function(self) {
     var authorization = new AuthorizationHelper();
     if(authorization.authNotRequired(self.params['controller'], self.params['action'])) {
         return;
     }
  	 authorization.validateSession(self.request.headers['auth_token'], self.session.get('account_info'), function(err, account) {
	       if(err) {
	    	   authorization.throwError(self, null, err, function(err1){});
	       }
		   else {
               var accountRole = 'READER';
               if(account){
                   accountRole = account.role;
               }
			   authorization.isAllowed(accountRole, self.session.controller.params.controller, self.session.controller.params.action, function(err){
			       if(err) {
				      authorization.throwError(self, accountRole, err);
				   }
			   });
		   }
     });
    }*/
	
};

exports.Application = Application;


getRoles = function() {
    var roles = [];
    roles[roles.length] = {id: 'ADMIN', name: 'Admin'};
    roles[roles.length] = {id: 'VOLUNTEER', name: 'Volunteer'};
    roles[roles.length] = {id: 'READER', name: 'Reader'};
    return roles;
}

getUserFriendlyErrorMessage = function(err, self) {
		geddy.log.error('------------------------------------ Error Start ---------------------------');
		if(self && self.session.get('account_info')) {
			geddy.log.error('ID:' + self.session.get('account_info').id);
		}
		geddy.log.error(err);
		geddy.log.error('------------------------------------ Error End ---------------------------');
		if(err) {
			if(err.code == 11000 || err.code == 11001) {
				if(err.message.indexOf('accountName') > 0) {
					return new Error('An account with given name already found.')
				}
				else {
					return new Error('A record with given name already found.')
				}
			}
			return err;
		}
}

logUserForAction = function(session, params) {
	if(session && session.get('account_info')) {
		geddy.log.info('--------------------- Action Log Start ----------------------------');
		geddy.log.info('Logged In User:' + session.get('account_info').id + ' (' + session.get('account_info').role + ') ');
		geddy.log.info('Action Performed: Controller-' + params['controller'] + '; Action-' + params['action']);
		geddy.log.info('--------------------- Action Log End ----------------------------');
	}
}


isAdmin = function(session) {
	if(session && session.get('account_info')) {
		return (session.get('account_info').role == 'ADMIN')
	}
	return false;
}

isVolunteer = function(session) {
	if(session && session.get('account_info')) {
		return (session.get('account_info').role == 'VOLUNTEER')
	}
	return false;
}

isReader = function(session) {
	if(session && session.get('account_info')) {
		return (session.get('account_info').role == 'READER')
	}
	return false;
}
