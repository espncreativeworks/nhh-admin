var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Ballot = keystone.list('Ballot').model
  , Athlete = keystone.list('Athlete').model
  , Vote = keystone.list('Vote').model
  , _ = require('underscore');

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
  var _medium = parseInt(doc.medium, 10)
    , validMediumCodes = [1, 2, 3, 4]
    , isValidMedium = true;

  // check for existence of submitted medium in valid mediums
  if (_.indexOf(validMediumCodes, _medium) === -1){
    isValidMedium = false;
  }

  // return early is medium is not valid
  if (!isValidMedium){
    return res.json(404, { name: 'Invalid Medium', message: 'Medium ' + doc.medium + ' is not a valid medium code.' });
  }

  Ballot.findOne({ _id: doc.ballot }).exec().then(function (ballot){
    var isValidAthlete = true;

    // check for existence of submitted athleteId in ballot.athletes
    if (_.indexOf(ballot.athletes, doc.athlete) === -1){
      isValidAthlete = false;
    }

    // return early if ballot is inactive
    if (!ballot.isActive){
      return res.json(404, { name: 'Invalid Ballot', message: 'Ballot ' + doc.ballot + ' is inactive' });
    }

    // return early is athlete is not part of the ballot
    if (!isValidAthlete){
      return res.json(404, { name: 'Invalid Athlete', message: 'Athlete ' + doc.athlete + ' is not a member of this ballot.' });
    }

    return Athlete.findOne({ _id: doc.athlete }).exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (athlete){

    // return early if is not active
    if (!athlete.isActive) {
      return res.json(404, { name: 'Invalid Athlete', message: 'Athlete ' + doc.athlete + ' is inactive.' });
    }

    return Vote.create(doc).exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
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
