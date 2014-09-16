var Prizes = function () {
  this.respondsWith = ['html', 'json'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.Prize.all(function(err, prizes) {
      if (err) {
        throw err;
      }
      geddy.model.UserType.all(function(err, userTypes) {
      if (err) {
          throw err;
      }
      self.respond({prizes: prizes, userTypes: userTypes});
      });
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , prize = geddy.model.Prize.create(params);

    if (!prize.isValid()) {
      this.respondWith(prize);
    }
    else {
      prize.save(function(err, data) {
        if (err) {
          throw err;
        }
        self.respondWith(prize, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Prize.first(params.id, function(err, prize) {
      if (err) {
        throw err;
      }
      if (!prize) {
        throw new geddy.errors.NotFoundError();
      }
      else {
        self.respondWith(prize);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Prize.first(params.id, function(err, prize) {
      if (err) {
        throw err;
      }
      if (!prize) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(prize);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Prize.first(params.id, function(err, prize) {
      if (err) {
        throw err;
      }
      prize.updateProperties(params);

      if (!prize.isValid()) {
        self.respondWith(prize);
      }
      else {
        prize.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(prize, {status: err});
        });
      }
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.Prize.first(params.id, function(err, prize) {
      if (err) {
        throw err;
      }
      if (!prize) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.Prize.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(prize);
        });
      }
    });
  };

};

exports.Prizes = Prizes;
