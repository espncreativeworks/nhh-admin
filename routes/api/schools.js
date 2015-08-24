var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , School = keystone.list('School').model
  , Q = require('q')
  , request = require('request')
  , _ = require('underscore');

function listSchools(req, res){
  console.log("list schools");
  var doc = {}
    , q;

  q = School.find(doc).select('-__v');

  q.exec().then(function(schools){
    res.json(200, schools);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showSchool(req, res){
  console.log("show schools");
  var doc = { _id: req.params.id }
    , q;

  q = School.findOne(doc).select('-__v');

  q.exec().then(function (school){
    res.json(200, school);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function createSchool(req, res) {
  console.log("create schools");
  var doc = {
    espnId: req.param('espnId'),
    name: req.param('name'),
    abbreviation: req.param('abbreviation'),
    primaryColor: req.param('primaryColor'),
    secondaryColor: null
  };
  //console.log(doc);

  if (doc.name === "Cal") {
    doc.name = "California";
  }

  School.findOne({name: doc.name }).exec().then(function (school){
    // console.log("school route: ", school);
    //school doesn't exist, add to db
    if (!school) {
      // console.log("school doesn't exist, add to db!");
      return School.create(doc);
    } else {
      return err;
    }
  }, function (err){
    console.log('Error school already exists...');
    console.error(err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (school){
    console.log("created school: ", school);
    var q = School.findOne(school);
    return q.exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (school){
    console.log("found school: ", school);
    res.json(201, school);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listSchools,
  show: showSchool,
  create: createSchool
};
