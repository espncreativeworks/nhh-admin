var keystone = require('keystone')
  , Athlete = keystone.list('Athlete').model;

function listAthletes(req, res){
  var doc = {}, q, refs, _selects;

  if (parseInt(req.query.active || 0, 10) === 1){
    doc.isActive = true;
  }

  q = Athlete.find(doc).select('-__v');

  if (req.query.populate && req.query.populate.trim().length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'school': '-__v -_id -totalVotes',
      'experience': '-__v -_id -totalVotes',
      'position': '-__v -_id -totalVotes'
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function(athletes){
    res.json(athletes);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showAthlete(req, res){
  var doc = { _id: req.params.id }, q, refs, _selects;

  q = Athlete.findOne(doc).select('-__v');

  if (req.query.populate && req.query.populate.trim().length > 0){
    refs = req.query.populate.trim().split(',');
    _selects = {
      'school': '-__v -_id -totalVotes',
      'experience': '-__v -_id -totalVotes',
      'position': '-__v -_id -totalVotes'
    };
    refs.forEach(function(ref){
      q.populate({
        path: ref,
        select: _selects[ref]
      });
    });
  }

  q.exec().then(function (athlete){
    if (athlete){
      res.json(200, athlete);
    } else {
      res.json(404, { name: 'Not Found', message: 'No Athlete found for :' + req.params.id });
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function createAthlete(req, res) {
  console.log("create athlete");
  var nameObj = {
    first: req.param('firstName'),
    last: req.param('lastName')
  };
  var doc = {
    espnId: req.param('espnId'),
    name: nameObj,
    jersey: req.param('jersey')
  };
  //console.log(doc);

  Athlete.findOne({name: doc.name }).exec().then(function (athlete){
    // console.log("school route: ", school);
    //athlete doesn't exist, add to db
    if (!athlete) {
      // console.log("school doesn't exist, add to db!");
      return Athlete.create(doc);
    } else {
      return err;
    }
  }, function (err){
    console.log('Error athlete already exists...');
    console.error(err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (athlete){
    console.log(athlete);
    var q = Athlete.findOne(athlete);
    return q.exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (athlete){
    //console.log(vote);
    res.json(201, athlete);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listAthletes,
  show: showAthlete,
  create: createAthlete
};
