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
  var voteData = req.body
    , doc = {
      ballot: ObjectId(voteData.ballotId),
      athlete: ObjectId(voteData.athleteId), 
      medium: voteData.medium
    };

  console.log(util.inspect(doc));
  Vote.create(doc).then(function (vote){
    res.json(201, vote);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showVote(req, res){
  var q = Vote.findOne({ _id: req.params.id }).exec();

  q.then(function (vote){
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
