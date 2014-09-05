var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Vote = keystone.list('Vote').model
  , util = require('util');

function listVotes(req, res){
  Vote.find().exec().then(function(votes){
    res.json(votes);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function createVote(req, res){
  var doc = {
      ballot: ObjectId(req.param('ballotId')),
      athlete: ObjectId(req.param('athleteId')),
      medium: req.param('medium')
    };

  Vote.create(doc).then(function (vote){
    var q = Vote.findOne(vote);
    q.populate('athlete', '_id name espnId slug');
    q.populate('ballot');
    return q.exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    res.json(201, vote);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showVote(req, res){
  var q = Vote.findOne({ _id: req.params.id });

  q.populate('athlete', 'name _id espnId').populate('ballot', '_id totalVotes');
  q.exec().then(function (vote){
    if (vote){
      res.json(200, vote);
    } else {
      res.json(404, { name: 'Not Found', message: 'No vote found for :' + req.params.id });
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listVotes,
  create: createVote,
  show: showVote
};
