var keystone = require('keystone')
  , TourStop = keystone.list('TourStop').model
  , _ = require('underscore');

function listTourStops(req, res){
  var doc = {}
    , q;

  q = TourStop.find(doc).select('-__v');
  q.populate('videos');
  q.populate('schools');

  q.exec().then(function(stops){
    console.log('[thumbnailImage] ' + stops[0].thumbnailImage);
    res.json(200, stops);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showTourStop(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = TourStop.findOne(doc).select('-__v');
  q.populate('videos');
  q.populate('schools');

  q.exec().then(function (stop){
    res.json(200, stop);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listTourStops,
  show: showTourStop
};
