var keystone = require('keystone')
  , Experience = keystone.list('Experience').model;

function listExperiences(req, res){
  var doc = {}
    , q;

  q = Experience.find(doc).select('-__v');

  q.exec().then(function(experiences){
    res.json(200, experiences);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showExperience(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Experience.findOne(doc).select('-__v');

  q.exec().then(function (experience){
    res.json(200, experience);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listExperiences,
  show: showExperience
};
