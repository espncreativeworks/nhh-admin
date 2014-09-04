var keystone = require('keystone')
  , Video = keystone.list('Video').model;

function listVideos(req, res){
  var doc = {}
    , q;

  q = Video.find(doc).select('-__v');

  q.exec().then(function(videos){
    res.json(200, videos);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showVideo(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Video.findOne(doc).select('-__v');

  q.exec().then(function (video){
    res.json(200, video);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listVideos,
  show: showVideo
};
