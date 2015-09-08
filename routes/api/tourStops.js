var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , TourStop = keystone.list('TourStop').model
  , _ = require('underscore');

function listTourStops(req, res){
  var doc = {}
    , q;

  q = TourStop.find(doc).sort('stopNumber');
  q.populate('timezone');
  q.populate('hosts');
  q.populate('guests');
  q.select('-__v');

  q.exec().then(function(stops){
    //console.log('[thumbnailImage] ' + stops[0].thumbnailImage);
    res.json(200, stops);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showTourStop(req, res){
  var key = req.params.id
    , doc = { $or: [ { slug: key } ] }
    , q;

  if (key.match(/^[0-9a-fA-F]{24}$/)) {
    doc.$or.push({ _id: key });
  }

  q = TourStop.findOne(doc);
  q.populate('videos');
  q.populate('schools');
  q.populate('timezone');
  q.populate('hosts');
  q.populate('guests');
  q.select('-__v');

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
