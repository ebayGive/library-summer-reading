var UserTypes = function () {
  this.respondsWith = ['html', 'json'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.UserType.all(function(err, userTypes) {
      if (err) {
        throw err;
      }
      self.respondWith(userTypes, {type:'UserType'});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , userType = geddy.model.UserType.create(params);

    if (!userType.isValid()) {
      this.respondWith(userType);
    }
    else if(userType['minAge'] > userType['maxAge']) {
        self.respondWith(new geddy.errors.BadRequestError('Minimum Age should be less than or equal to Maximum Age.'));
    } else {
      userType.save(function(err, data) {
        if (err) {
          throw err;
        }
        self.respondWith(userType, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.UserType.first(params.id, function(err, userType) {
      if (err) {
        throw err;
      }
      if (!userType) {
        throw new geddy.errors.NotFoundError();
      }
      else {
        self.respondWith(userType);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.UserType.first(params.id, function(err, userType) {
      if (err) {
        throw err;
      }
      if (!userType) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(userType);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.UserType.first(params.id, function(err, userType) {
      if (err) {
        throw err;
      }
      userType.updateProperties(params);

      if (!userType.isValid()) {
        self.respondWith(userType);
      }
      else if(userType['minAge'] > userType['maxAge']) {
        self.respondWith(new geddy.errors.BadRequestError('Minimum Age should be less than or equal to Maximum Age.'));
      }
      else {
        userType.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(userType, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.UserType.first(params.id, function(err, userType) {
      if (err) {
        throw err;
      }
      if (!userType) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.UserType.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(userType);
        });
      }
    });
  };

};

exports.UserTypes = UserTypes;
