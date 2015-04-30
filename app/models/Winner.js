
var Winner = function () {

    this.defineProperties({
        accountId : {type: 'string'},
        accountName:{type: 'string'},
        firstName: {type: 'string'},
        lastName: {type: 'string'},
        userType: {type: 'string'},
        phone: {type: 'string'},
        emailAddress: {type: 'string'}

    });



};

/*
 // Can also define them on the prototype
 User.prototype.someOtherMethod = function () {
 // Do some other stuff
 };
 // Can also define static methods and properties
 User.someStaticMethod = function () {
 // Do some other stuff
 };
 User.someStaticProperty = 'YYZ';
 */

Winner = geddy.model.register('Winner', Winner);
exports.Winner = Winner;
