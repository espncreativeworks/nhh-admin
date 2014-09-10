var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Ballot = keystone.list('Ballot').model
  , Athlete = keystone.list('Athlete').model
  , Vote = keystone.list('Vote').model
  , School = keystone.list('School').model
  , Experience = keystone.list('Experience').model
  , Position = keystone.list('Position').model
  , _ = require('underscore');

function listVotes(req, res){
  var doc = {}, q, refs, _selects;

  if ('ballotId' in req.query){
    doc.ballot = ObjectId(req.query.ballotId);
  }

  if ('medium' in req.query){
    doc.medium = parseInt(req.query.medium, 10);
  }

  q = Vote.find(doc).select('-__v');

  if ('populate' in req.query && req.query.populate.trim().split(',').length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'athlete': '-__v',
      'ballot': '-__v'
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function(votes){
    if (refs && refs.length){
      var opts = []
        , paths = ['school', 'experience', 'position']
        , selects = {
          school: '-_id -__v -totalVotes',
          experience: '-_id -__v -totalVotes',
          position: '-_id -__v -totalVotes'
        }
        , models = {
          school: School,
          experience: Experience,
          position: Position
        };

      paths.forEach(function (_path){
        opts.push({
          path: 'athlete.' + _path,
          model: models[_path],
          select: selects[_path]
        });
      });

      return Athlete.populate(votes, opts);
    } else {
      return votes;
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (votes){
    res.json(200, votes);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).end();
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
