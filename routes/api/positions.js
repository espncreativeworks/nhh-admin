var keystone = require('keystone')
  , Position = keystone.list('Position').model;

function listPositions(req, res){
  var doc = {}
    , q;

  q = Position.find(doc).select('-__v');

  q.exec().then(function(positions){
    res.json(200, positions);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showPosition(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Position.findOne(doc).select('-__v');

  q.exec().then(function (position){
    res.json(200, position);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listPositions,
  show: showPosition
};
