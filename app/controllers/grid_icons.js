var GridIcons = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.GridIcon.all(function(err, gridIcons) {
      if (err) {
        throw err;
      }
      self.respondWith(gridIcons, {type:'GridIcon'});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , gridIcon = geddy.model.GridIcon.create(params);

    if (!gridIcon.isValid()) {
      this.respondWith(gridIcon);
    }
    else {
      gridIcon.save(function(err, data) {
        if (err) {
          throw err;
        }
        self.respondWith(gridIcon, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.GridIcon.first(params.id, function(err, gridIcon) {
      if (err) {
        throw err;
      }
      if (!gridIcon) {
        throw new geddy.errors.NotFoundError();
      }
      else {
        self.respondWith(gridIcon);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.GridIcon.first(params.id, function(err, gridIcon) {
      if (err) {
        throw err;
      }
      if (!gridIcon) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(gridIcon);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.GridIcon.first(params.id, function(err, gridIcon) {
      if (err) {
        throw err;
      }
      gridIcon.updateProperties(params);

      if (!gridIcon.isValid()) {
        self.respondWith(gridIcon);
      }
      else {
        gridIcon.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(gridIcon, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.GridIcon.first(params.id, function(err, gridIcon) {
      if (err) {
        throw err;
      }
      if (!gridIcon) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.GridIcon.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(gridIcon);
        });
      }
    });
  };

};

exports.GridIcons = GridIcons;
