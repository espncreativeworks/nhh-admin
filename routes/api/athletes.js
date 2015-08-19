var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Athlete = keystone.list('Athlete').model
  , School = keystone.list('School').model
  , Ballot = keystone.list('Ballot').model
  , Experience = keystone.list('Experience').model
  , Position = keystone.list('Position').model
  , _ = require('underscore');

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
  console.log("createAthlete nameObj: ", nameObj);
  var doc = {
    espnId: req.param('espnId'),
    name: nameObj,
    jersey: req.param('jersey'),
    isWritein: true,
    schoolName: req.param('school'),
    experienceName: req.param('experience'),
    positionName: req.param('position')
  };
  console.log(doc);

  School.findOne({name: doc.schoolName}).exec().then(function (school){
    // console.log("school._id: ", school._id);
    _doc = _.extend(doc, {school: ObjectId(school._id)});
    return _doc;
  }).then(function (_doc) {
    // console.log("after school: ", _doc);
    return Experience.findOne({name: _doc.experienceName}).exec();
  }).then(function (exp) {
    // console.log("exp: ", exp);
    _doc = _.extend(doc, {experience: ObjectId(exp._id)});
    return _doc;
  }).then(function (_doc){
    // console.log("after experience: ", _doc);
    //console.log(Position.findOne({name: _doc.positionName}));
    return Position.findOne({name: _doc.positionName}).exec();
  }).then(function (pos){
    // console.log("pos: ", pos);
    _doc = _.extend(doc, {position: ObjectId(pos._id)});
    // console.log("_doc: ", _doc);
    return _doc;
  }).then(function (_doc) {
    console.log("got all athlete elements");
    Athlete.findOne({name: _doc.name }).exec().then(function (athlete){
      //athlete doesn't exist, add to db
      // console.log("athlete find one: ", athlete);
      if (!athlete) {
        return Athlete.create(_doc);
      } else {
        return err;
      }
    }, function (err){
      console.log('Error athlete already exists...');
      console.error(err);
      res.json(500, { name: err.name, message: err.message });
    }).then(function (athlete){
      console.log("athlete created: ", athlete);
      var q = Athlete.findOne(athlete);
      return q.exec();
    }, function (err){
      console.log("error loading athlete");
      res.json(500, { name: err.name, message: err.message });
    }).then(function (athlete){
      console.log("q.exec: ", athlete);
      res.json(201, athlete);
    }, function (err){
      console.log("no athlete..");
      res.json(500, { name: err.name, message: err.message });
    });
  });
}

exports = module.exports = {
  list: listAthletes,
  show: showAthlete,
  create: createAthlete
};
