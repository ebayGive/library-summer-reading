
var Reports = function () 
{
      var self = this;
	  this.respondsWith = ['html', 'json'];
  
	  this.index = function (req, resp, params) 
	  {
		     var report  = {}; 
		     report.totalAccounts = 0;
		     report.totalRAdmins = 0;
		     report.totalRVolunteers = 0;
		     report.totalRReaders = 0;
			 report.totalUsers = 0;
			 report.totalReaders = 0;
			 report.totalTeen = 0;
			 report.totalAdult = 0; 
			 report.totalStaff = 0;
			 report.totalPreReaders = 0;
			 report.agereports = {};
			 report.branchreports = {};
			 
			 for(var i=0; i<100; i++) // initialize age reports
			 {
					 var agereport = {};
					 agereport.name = i;
					 agereport.totalAccounts = 0;
					 agereport.totalUsers = 0;
					 agereport.totalReaders = 0;
					 agereport.totalTeen = 0;
					 agereport.totalAdult = 0;
					 agereport.totalStaff = 0;
					 agereport.totalPreReaders = 0;
					  
					 report.agereports[parseInt(i)] = agereport;
			 }
			 
		 	 geddy.model.Account.all({}, {sort: 'branchId'}, function(err, accounts)
			 {
				 if(err) 
				 {
				        self.respondWith(new geddy.errors.BadRequestError());
				 }
				 else if(!accounts) 
				 {
				        self.respondWith(new geddy.errors.BadRequestError());
				 }
				 else
				 {
					 	self.populateReport(accounts, report, function(err, result)
			 			{
					 		 if(err) 
							 {
							        self.respondWith(new geddy.errors.BadRequestError());
							 }
							 else if(!result) 
							 {
							        self.respondWith(new geddy.errors.BadRequestError());
							 }
							 else
							 {
								 	self.respond({result: result}); 
							 }
			 			});
				 }
			 });
	  };
	  
	  this.populateReport = function (accounts, report, callbackFn) 
	  {
			 geddy.model.Branch.all({},{sort: 'name'},function(err, branches) 
			 {
					if(err) 
					{
						callbackFn(new Error('Unable to get branch details, Error: ', err));
					}
					else if(!branches) 
					{
						callbackFn(new Error('Bbranch info is null'));
					}
					else
					{
						 var i = 0;
						 
						 for(branch in branches)
						 {
								if (branches[branch].id != 'undefined')
								{
									 var branchreport = {};
									 branchreport.name = branches[branch].name;
									 branchreport.branchid = branches[branch].id;
									 branchreport.totalAccounts = 0;
									 branchreport.totalUsers = 0;
									 branchreport.totalReaders = 0;
									 branchreport.totalTeen = 0;
									 branchreport.totalAdult = 0;
									 branchreport.totalStaff = 0;
									 branchreport.totalPreReaders = 0;
									 branchreport.agereports = {};
									 
									 for(var j=0; j<100; j++) // initialize age reports
									 {
											 var agereport = {};
											 agereport.name = j;
											 agereport.totalAccounts = 0;
											 agereport.totalUsers = 0;
											 agereport.totalReaders = 0;
											 agereport.totalTeen = 0;
											 agereport.totalAdult = 0;
											 agereport.totalStaff = 0;
											 agereport.totalPreReaders = 0;
											  
											 branchreport.agereports[parseInt(j)] = agereport;
									 }
									 
									 report.branchreports[i++] = branchreport;
								}
						 }
						 
						 self.populateReportDetails(accounts, report, function(err, result)
						 {
						 		 if(err) 
								 {
										callbackFn(new Error('Unable to get Report details, Error: ', err));
								 }
								 else if(!result) 
								 {
										callbackFn(new Error('result is null'), result);
								 }
								 else
								 {
									 	callbackFn(null, result);
								 }
			 			});
					}
			 });
	  };
	  
	  this.populateReportDetails = function (accounts, report, callbackFn) 
	  {
			 geddy.model.UserType.all({},{sort: 'minAge'},function(err, userTypes) 
			 {
					if(err) 
					{
						callbackFn(new Error('Unable to get UserType details, Error: ', err));
					}
					else if(!userTypes) 
					{
						callbackFn(new Error('UserType is null'));
					}
					else
					{
						 self.populateData(accounts, report, userTypes, function(err, result)
						 {
						 		 if(err) 
								 {
										callbackFn(new Error('Unable to get populate data, Error: ', err));
								 }
								 else if(!result) 
								 {
										callbackFn(new Error('result is null'), result);
								 }
								 else
								 {
									 	callbackFn(null, result);
								 }
						 });
					}
			 });
	  };
	  
	  this.populateData = function (accounts, report, userTypes, callbackFn) 
	  {
		  	  var result;
		  	  
			  if(accounts == 'undefined' || userTypes == 'undefined')
			  {
				  callbackFn(new Error('No accounts/userType found'), result);
				  return;
			  }
			 
			  for(account in accounts) 
		      {
				  	 if(accounts[account] == 'undefined' || accounts[account].branchId == 'undefined' || accounts[account].role == 'undefined')
					 {
						 continue;
					 }
					 
					 report.totalAccounts++;
					 
					 if(accounts[account].role.toLowerCase() == 'ADMIN'.toLowerCase())
					 {
					     report.totalRAdmins++;
					 }
					 else if(accounts[account].role.toLowerCase() == 'VOLUNTEER'.toLowerCase())
					 {
					     report.totalRVolunteers++;
					 }
					 else if(accounts[account].role.toLowerCase() == 'READER'.toLowerCase())
					 {
					     report.totalRReaders++;
					 }
					 
					 
					 for(branchreport in report.branchreports)
					 {
							 if (report.branchreports[branchreport].branchid == 'undefined' || report.branchreports[branchreport].branchid != accounts[account].branchId)
							 {
									continue;
							 }
						
							 report.branchreports[branchreport].totalAccounts++;
							 var users = accounts[account].users;
							 
						     for(user in users)
							 {
									 var userTypeId = users[user].userType;
									 var age = parseInt(typeof  users[user].age == 'undefined' || users[user].age == 'undefined ' || users[user].age == '' || users[user].age == 'NaN' ? '0' : users[user].age); 
									 if(age < 0) {
										 age = 0;
									 }
									 else if(age > 100) {
										 age = 100;
									 }
									
									 report.agereports[age].totalUsers++;
									 
									 for(userTypeTemp in userTypes)
									 {
											 if (userTypeTemp == 'undefined' || userTypes[userTypeTemp].name == 'undefined' || userTypes[userTypeTemp].id != userTypeId)
											 {
													continue;
											 }
											 
											 report.totalUsers++;
											 report.branchreports[branchreport].totalUsers++;
											 report.branchreports[branchreport].agereports[age].totalUsers++;

											 if(userTypes[userTypeTemp].name.toLowerCase() == 'Reader'.toLowerCase())
											 {
												 report.totalReaders++;
												 report.branchreports[branchreport].totalReaders++;
												 report.agereports[age].totalReaders++;
												 report.branchreports[branchreport].agereports[age].totalReaders++;
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'Adult'.toLowerCase())
											 {
												 report.totalAdult++;
												 report.branchreports[branchreport].totalAdult++;
												 report.agereports[age].totalAdult++;
												 report.branchreports[branchreport].agereports[age].totalAdult++;
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'Teen'.toLowerCase())
											 {
												 report.totalTeen++;
												 report.branchreports[branchreport].totalTeen++;
												 report.agereports[age].totalTeen++;
												 report.branchreports[branchreport].agereports[age].totalTeen++;
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'Pre-Reader'.toLowerCase())
											 {
												 report.totalPreReaders++;
												 report.branchreports[branchreport].totalPreReaders++;
												 report.agereports[age].totalPreReaders++;
												 report.branchreports[branchreport].agereports[age].totalPreReaders++;
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'STAFF SJPL'.toLowerCase())
											 {
												 report.totalStaff++;
												 report.branchreports[branchreport].totalStaff++;
												 report.agereports[age].totalStaff++;
												 report.branchreports[branchreport].agereports[age].totalStaff++;
											 }
											 
											 break;
									 }
							 }
						     
						     break;
					 }
		      }
			  
			  result = report;
			  callbackFn(null, result);
	  };
};

exports.Reports = Reports;
