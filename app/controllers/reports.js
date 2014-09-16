
var HashMap = require('hashmap').HashMap;

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
			 report.totalParents = 0; 
			 report.totalStaff = 0;
			 report.totalPreReaders = 0;
			 report.agereports = {};
			 report.branchreports = {};
			 
			 for(var i=0; i<100; i++) // initialize age reports
			 {
					 var agereport = {};
					 agereport.name = i == 60 ? '60+' : '<= ' + i;
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
									 branchreport.totalParents = 0;
									 branchreport.totalStaff = 0;
									 branchreport.totalPreReaders = 0;
									 branchreport.agereports = {};
									 
									 for(var j=0; j<100; j++) // initialize age reports
									 {
											 var agereport = {};
											 agereport.name = j == 60 ? '60+' : '<= ' + j;
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
							 
							 var isParent = false;
							 var isChild = false;

							 for(user in users)
							 {
									 var userTypeId = users[user].userType;
									 var age = 0;
									 
									 try
									 {
										 age = parseInt(typeof  users[user].age == 'undefined' || users[user].age == 'undefined ' || users[user].age == '' || users[user].age == 'NaN' ? '-1' : users[user].age); 
										 
										 if(age < 0) 
										 {
											 age = 0;
										 }
										 else if(age <= 5) 
										 {
											 age = 5;
										 }
										 else if(age <= 12) 
										 {
											 age = 12;
										 }
										 else if(age <= 18) 
										 {
											 age = 18;
										 }
										 else if(age <= 30) 
										 {
											 age = 30;
										 }
										 else if(age <= 49) 
										 {
											 age = 49;
										 }
										 else if(age <= 59) 
										 {
											 age = 59;
										 }
										 else if(age > 59) 
										 {
											 age = 60;
										 }
										 
										 if(report.agereports[age] != 'undefined')
										 {
											report.agereports[age].totalUsers++;
										 }
									 }
									 catch(err)
									 {
										  age = 0;
									 }
 
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
												 isChild = true;
												 report.totalReaders++;
												 report.branchreports[branchreport].totalReaders++;
												 
												 if(report.agereports[age] != 'undefined' && report.branchreports[branchreport].agereports[age] != 'undefined')
												 {
													report.agereports[age].totalReaders++;
													report.branchreports[branchreport].agereports[age].totalReaders++;
												 }
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'Adult'.toLowerCase())
											 {
												 isParent = true;
												 report.totalAdult++;
												 report.branchreports[branchreport].totalAdult++;
												 
												 if(report.agereports[age] != 'undefined' && report.branchreports[branchreport].agereports[age] != 'undefined')
												 {
													 report.agereports[age].totalAdult++;
													 report.branchreports[branchreport].agereports[age].totalAdult++;
												 }
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'Teen'.toLowerCase())
											 {
												 isChild = true;
												 report.totalTeen++;
												 report.branchreports[branchreport].totalTeen++;
												 
												 if(report.agereports[age] != 'undefined' && report.branchreports[branchreport].agereports[age] != 'undefined')
												 {
													 report.agereports[age].totalTeen++;
													 report.branchreports[branchreport].agereports[age].totalTeen++;
												 }
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'Pre-Reader'.toLowerCase())
											 {
												 isChild = true;
												 report.totalPreReaders++;
												 report.branchreports[branchreport].totalPreReaders++;
												 
												 if(report.agereports[age] != 'undefined' && report.branchreports[branchreport].agereports[age] != 'undefined')
												 {
													 report.agereports[age].totalPreReaders++;
													 report.branchreports[branchreport].agereports[age].totalPreReaders++;
												 }
											 }
											 else if(userTypes[userTypeTemp].name.toLowerCase() == 'STAFF SJPL'.toLowerCase())
											 {
												 report.totalStaff++;
												 report.branchreports[branchreport].totalStaff++;
												 
												 if(report.agereports[age] != 'undefined' && report.branchreports[branchreport].agereports[age] != 'undefined')
												 {
													 report.agereports[age].totalStaff++;
													 report.branchreports[branchreport].agereports[age].totalStaff++;
												 }
											 }
											 
											 break;
									 }
							 }
							 
							 if(isParent && isChild)
							 {
								 report.totalParents++;
								 report.branchreports[branchreport].totalParents++;
							 }
							 
						     break;
					 }
		      }
			  
			  result = report;
			  callbackFn(null, result);
	  };
	  
	  this.prize = function (req, resp, params) 
	  {
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
					 	self.populateBranch(accounts, function(err, result)
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
	  
	  this.populateBranch = function (accounts, callbackFn) 
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
						 self.populateUserTypes(accounts, branches, function(err, result)
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
	  
	  this.populateUserTypes = function (accounts, branches, callbackFn) 
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
						 self.populatePrizeData(accounts, branches, userTypes, function(err, result)
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
	  
	  this.populatePrizeData = function (accounts, branches, userTypes, callbackFn) 
	  {
			  var prize = new HashMap();
			  var summaryPrize = new HashMap();
		  	  var result = {};
		  	  result.summaryPrize = new HashMap();
		  	  result.prize = new HashMap();
		  	  result.userTypes = {};
		  	  result.branches = {};
		  	  
			  if(typeof accounts == 'undefined' || typeof branches == 'undefined' || typeof userTypes == 'undefined')
			  {
				  callbackFn(new Error('No accounts/branches/userType found'), result);
				  return;
			  }
			  
			  for(tid in userTypes)
			  {
			 	 if (typeof userTypes[tid] != 'undefined' && typeof userTypes[tid].name != 'undefined')
				 {
					 result.userTypes[tid] = userTypes[tid];
				 }
			  }

			  for(bid in branches)
			  {
					 if (typeof branches[bid] == 'undefined' || typeof branches[bid].name == 'undefined')
					 {
							continue;
					 }
					 
					 result.branches[bid] = branches[bid];
			  }
				
			  for(account in accounts) 
		      {
				  	 if(typeof accounts[account] == 'undefined' || typeof accounts[account].users == 'undefined' || typeof accounts[account].branchId == 'undefined')
					 {
						 continue;
					 }
					 
					 for(bid in branches)
					 {
						 	 var branch = branches[bid]; 
						 	 
							 if (typeof branch == 'undefined' || typeof branch.id == 'undefined' || branch.id != accounts[account].branchId)
							 {
									continue;
							 }
						
							 var users = accounts[account].users;
							 
						     for(uid in users)
							 {
						    	  	 var user = users[uid];
						    	  	 
							    	 if (typeof user == 'undefined' || typeof user.userType == 'undefined')
									 {
											 continue;
									 } 
						    	 	 
									 for(tid in userTypes)
									 {
										 	 var userType = userTypes[tid];
										 	 
											 if (typeof userType == 'undefined' || typeof userType.id == 'undefined' || userType.id != user.userType)
											 {
													continue;
											 }
											 
											 var branchName = branch.name;
											 var userTypeName = userType.name.toUpperCase();
											 
											 if(typeof prize.get(branchName) == 'undefined')
											 {
												 prize.set(branchName, new HashMap());
											 }
											 
											 var pbranch = prize.get(branchName);
											 
											 if(typeof pbranch.get(userTypeName) == 'undefined')
											 {
												 pbranch.set(userTypeName, new HashMap());
											 }
											 
											 if(typeof summaryPrize.get(userTypeName) == 'undefined')
											 {
												 summaryPrize.set(userTypeName, new HashMap());
											 }
											 
											 var puserType = pbranch.get(userTypeName);
											 var summaryUserType = summaryPrize.get(userTypeName);
											 
											 for(var i = 0; i<=5 ; i++)
											 {
												 if(typeof user.prizes[i] == 'undefined' || typeof user.prizes[i].state == 'undefined')
												 {
													 continue;
												 }
												 
												 if(typeof puserType.get(i) == 'undefined')
												 {
													 puserType.set(i, new HashMap());
												 }
												 
												 if(typeof summaryUserType.get(i) == 'undefined')
												 {
													 summaryUserType.set(i, new HashMap());
												 }
												 
												 var prizeType = puserType.get(i);
												 var summaryPrizeType = summaryUserType.get(i);
													 
												 for(var j = 0; j<=2 ; j++)
												 {
												 	 if(user.prizes[i].state == j) 
													 {
														 if(typeof prizeType.get(j) == 'undefined')
														 {
															 prizeType.set(j, 0);
														 }
														 
														 if(typeof summaryPrizeType.get(j) == 'undefined')
														 {
															 summaryPrizeType.set(j, 0);
														 }
														 
														 prizeType.set(j, prizeType.get(j) + 1);
														 summaryPrizeType.set(j, summaryPrizeType.get(j) + 1);
													 }
												 }
											 }
											 
											 break;
									 }
									 
							 }
						     
						     break;
					 }
		      }
			  
			  result.prize = prize;
			  result.summaryPrize = summaryPrize;
			  callbackFn(null, result);
	  };
};

exports.Reports = Reports;
