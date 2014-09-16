var Grids = function () {
  this.respondsWith = ['html', 'json'];

  this.index = function (req, resp, params) {
    var self = this;
    if(typeof params['userType'] != "undefined") {
        geddy.model.Grid.first({userType: params['userType']}, function(err, grid) {
          if (err) {
            throw err;
          }
         /* Issue with MongoDb module on handling error. Fix will be availale in 1.4*/
          if (!grid) {
            self.respondWith(new geddy.errors.NotFoundError('Grid Not found'));
          }
          else {
            self.respondWith(grid);
         }
        });
     }
     else {
        geddy.model.Grid.all(function(err, grids) {
          if (err) {
            throw err;
          }
          geddy.model.GridIcon.all(function(err, gridIcons) {
            self.respond({grids: grids, gridIcons: gridIcons});
          });
        });
     }
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , grid = geddy.model.Grid.create(params);

    if (!grid.isValid()) {
      this.respondWith(grid);
    }
    else {
      grid.save(function(err, data) {
        if (err) {
          throw err;
        }
          self.respondWith(grid, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Grid.first(params.id, function(err, grid) {
      if (err) {
        throw err;
      }
      if (!grid) {
        self.respondWith(new geddy.errors.NotFoundError('Grid Not found'));
      }
      else {
        self.respondWith(grid);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Grid.first(params.id, function(err, grid) {
      if (err) {
        throw err;
      }
      if (!grid) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(grid);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Grid.first(params.id, function(err, grid) {
      if (err) {
        throw err;
      }
      grid.updateProperties(params);

      if (!grid.isValid()) {
        self.respondWith(grid);
      }
      else {
        grid.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(grid, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.Grid.first(params.id, function(err, grid) {
      if (err) {
        throw err;
      }
      if (!grid) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.Grid.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(grid);
        });
      }
    });
  };

};

exports.Grids = Grids;
