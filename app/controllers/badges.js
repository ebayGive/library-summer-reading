var formidable = require('formidable')
  , fs = require('fs')
  , path = require('path');

var AuthorizationHelper = require('../helpers/authorization_helper');
var Badges = function () {
  this.respondsWith = ['html', 'json'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.Badge.all({},{sort: 'bdgId'},function(err, badges) {
      if (err) {
        throw err;
      }
      self.respondWith(badges, {type:'Badge'});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    var self = this
      , badge = geddy.model.Badge.create(params);

    if (!badge.isValid()) {
      this.respondWith(badge);
    }
    else {
      badge.save(function(err, data) {
        if (err) {
          throw err;
        }
        self.respondWith(badge, {status: err});
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Badge.first(params.id, function(err, badge) {
      if (err) {
        throw err;
      }
      if (!badge) {
        throw new geddy.errors.NotFoundError();
      }
      else {
        self.respondWith(badge);
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Badge.first(params.id, function(err, badge) {
      if (err) {
        throw err;
      }
      if (!badge) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        self.respondWith(badge);
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Badge.first(params.id, function(err, badge) {
      if (err) {
        throw err;
      }
      badge.updateProperties(params);

      if (!badge.isValid()) {
        self.respondWith(badge);
      }
      else {
        badge.save(function(err, data) {
          if (err) {
            throw err;
          }
          self.respondWith(badge, {status: err});
        });
      }
    });
  };

  this.updateFile = function (req, resp, params) {
    var self = this;

    var self = this
      , form = new formidable.IncomingForm()
      , uploadedFile
      , savedFile;

        // Handle each part of the multi-part post
    form.onPart = function (part) {
      // Handle each data chunk as data streams in
      part.addListener('data', function (data) {
        // Initial chunk, set the filename and create the FS stream
        if (!uploadedFile) {
          uploadedFile = part.filename;
          savedFile = fs.createWriteStream(path.join('public', 'img', 'badges', uploadedFile));
        }
        // Write each chunk to disk
        savedFile.write(data);
      });
      // The part is done
      part.addListener('end', function () {
        var err;
        // If everything went well, close the FS stream
        if (uploadedFile) {
          savedFile.end();
          self.respond(uploadedFile);
        }
        // Something went wrong
        else {
          err = new Error('Something went wrong in the upload.');
          self.respondWith(err);
        }
      });
    };

        // Multi-part form is totally done, redirect back to index
    // and pass filename
    form.addListener('end', function () {
      self.redirect('/?uploaded_file=' + uploadedFile);
    });

    // Do it
    form.parse(req);
  };

  this.remove = function (req, resp, params) {
    geddy.model.Badge.first(params.id, function(err, badge) {
      if (err) {
        throw err;
      }
      if (!badge) {
        throw new geddy.errors.BadRequestError();
      }
      else {
        geddy.model.Badge.remove(params.id, function(err) {
          if (err) {
            throw err;
          }
          self.respondWith(badge);
        });
      }
    });
  };

};

exports.Badges = Badges;
