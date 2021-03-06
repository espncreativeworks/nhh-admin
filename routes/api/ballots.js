var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Ballot = keystone.list('Ballot').model
  , Athlete = keystone.list('Athlete').model
  , School = keystone.list('School').model
  , Experience = keystone.list('Experience').model
  , Position = keystone.list('Position').model
  , Q = require('q');

function listBallots(req, res){
  var doc = {}, q, refs, _selects, multi = true;

  if (parseInt(req.query.active || 0, 10) === 1){
    doc.isActive = true;
    multi = false;
  }

  if (multi){
    q = Ballot.find(doc).select('-__v');
  } else {
    q = Ballot.findOne(doc).select('-__v');
  }

  if ('populate' in req.query && req.query.populate.trim().split(',').length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'athletes': '-__v '
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function(ballots){
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
          path: 'athletes.' + _path,
          model: models[_path],
          select: selects[_path]
        });
      });

      return Athlete.populate(ballots, opts);
    } else {
      return ballots;
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (ballots){
    res.json(200, ballots);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).end();
}

function showBallot(req, res){
  var doc = { _id: req.params.id }
    , q
    , refs
    , _selects;

  q = Ballot.findOne(doc).select('-__v');

  if ('populate' in req.query && req.query.populate.trim().length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'athletes': '-__v '
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function (ballot){
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
          path: 'athletes.' + _path,
          model: models[_path],
          select: selects[_path]
        });
      });
      return Athlete.populate(ballot, opts);
    } else {
      return ballot;
    }
  }, function (err){
    console.log("ballot route q.exec err: ", err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (ballot){
    res.json(200, ballot);
  }, function (err){
    console.log("ballot route success err: ", err);
    res.json(500, { name: err.name, message: err.message });
  }).end();
}

function addAthlete(req, res) {
  var doc = { 
    ballotId: ObjectId(req.param('ballotId')),
    athleteId: ObjectId(req.param('_id'))
  }

  console.log("add athlete: ", doc);

  Ballot.findOne({ _id: doc.ballotId }).exec().then(function (res){
    console.log("writeins: ", res.writein);
    console.log("athletes: ", res.athletes);
    console.log("doc.athlete: ", doc.athleteId);

    if (res.athletes.indexOf(doc.athleteId) === -1) {
      console.log("not on current ballot");
      
      if (res.writein.indexOf(doc.athleteId) === -1) {
        console.log("not a writein athlete");
      
        _conditions = { _id: doc.ballotId }
        , _update = { $push: { "writein": doc.athleteId } }
        , _options = { multi: true, upsert: true };

        Ballot.update(_conditions, _update, _options).exec().then(function (result){
          console.log("add athlete to ballot result: ", result);
        }, function (err){
          console.error('Error from ballot update: ', err);
        });
      } else {
        console.log("already part of writein ballot" + res.writein.indexOf(doc.athleteId));
      }
    } else {
      console.log("already part of athlete list: ", res.athletes.indexOf(doc.athleteId));
    }
  });
}

exports = module.exports = {
  list: listBallots,
  show: showBallot,
  create: addAthlete
};
