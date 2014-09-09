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
  //console.log(doc);

  var _medium = parseInt(doc.medium, 10)
    , validMediumCodes = [1, 2, 3, 4]
    , isValidMedium = true
    , err;

  // check for existence of submitted medium in valid mediums
  if (_.indexOf(validMediumCodes, _medium) === -1){
    isValidMedium = false;
  }

  // return early is medium is not valid
  if (!isValidMedium){
    err = new Error('Invalid Medium');
    err.message = 'Medium ' + doc.medium + ' is not a valid medium code.';
    throw err;
  }

  Ballot.findOne({ _id: doc.ballot }).exec().then(function (ballot){
    //console.log(ballot);
    var isValidAthlete = false;

    // check for existence of submitted athleteId in ballot.athletes
    //console.log(ballot.athletes[0].toString());
    ballot.athletes.forEach(function (_athleteId){
      if (_athleteId.toString() === doc.athlete.toString()){
        isValidAthlete = true;
      }
    });

    // if (_.indexOf(ballot.athletes, doc.athlete) === -1){
    //   isValidAthlete = false;
    // }

    // return early if ballot is inactive
    if (!ballot.isActive){
      err = new Error('Invalid Ballot');
      err.message = 'Ballot ' + doc.ballot + ' is inactive';
      throw err;
    }

    // return early is athlete is not part of the ballot
    if (!isValidAthlete){
      err = new Error('Invalid Athlete');
      err.message = 'Athlete ' + doc.athlete + ' is not a member of this ballot.';
      throw err;
    }

    return Athlete.findOne({ _id: doc.athlete }).exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (athlete){
    var err;
    //console.log(athlete);

    // return early if is not active
    if (!athlete.isActive) {
      err = new Error('Invalid Athlete');
      err.message = 'Athlete ' + doc.athlete + ' is inactive.';
      throw err;
    }

    return Vote.create(doc);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    //console.log(vote);
    var q = Vote.findOne(vote);
    q.populate('athlete', '_id name espnId slug totalVotes');
    q.populate('ballot', '_id totalVotes');
    return q.exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    //console.log(vote);
    res.json(201, vote);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).end();
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
