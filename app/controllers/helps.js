var Helps = function () {
  this.respondsWith = ['html'];

  this.applicationHelp = function (req, resp, params) {
    this.respond(params);
  };
};

exports.Helps = Helps;
