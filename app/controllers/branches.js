var AuthorizationHelper = require('../helpers/authorization_helper');
var Branches = function () {
  this.respondsWith = ['html', 'json'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.Branch.all({},{sort: 'name'},function(err, branches) {
      if (err) {
        throw err;
      }
      self.respondWith(branches, {type:'Branch'});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , branch = geddy.model.Branch.create(params);

    if (!branch.isValid()) {
      this.respondWith(branch);
    }
    else {
      branch.save(function(err, data) {
        if (err) {
          throw err;
        }
        self.respondWith(branch, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Branch.first(params.id, function(err, branch) {
      if (err) {
        throw err;
      }
      if (!branch) {
        throw new geddy.errors.NotFoundError();
      }
      else {
        self.respondWith(branch);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Branch.first(params.id, function(err, branch) {
      if (err) {
        throw err;
      }
      if (!branch) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(branch);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Branch.first(params.id, function(err, branch) {
      if (err) {
        throw err;
      }
      branch.updateProperties(params);

      if (!branch.isValid()) {
        self.respondWith(branch);
      }
      else {
        branch.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(branch, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.Branch.first(params.id, function(err, branch) {
      if (err) {
        throw err;
      }
      if (!branch) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.Branch.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(branch);
        });
      }
    });
  };

};

exports.Branches = Branches;
