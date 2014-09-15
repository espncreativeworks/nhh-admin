var keystone = require('keystone')
  , Timezone = keystone.list('Timezone').model;

function listTimezones(req, res){
  var doc = {}
    , q;

  q = Timezone.find(doc).select('-__v');

  q.exec().then(function(Timezones){
    res.json(200, Timezones);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showTimezone(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Timezone.findOne(doc).select('-__v');

  q.exec().then(function (Timezone){
    res.json(200, Timezone);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listTimezones,
  show: showTimezone
};
