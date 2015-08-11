var keystone = require('keystone')
  , Position = keystone.list('Position').model;

function listPositions(req, res){
  var doc = {}
    , q;

  q = Position.find(doc).select('-__v');

  q.exec().then(function(positions){
    res.json(200, positions);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showPosition(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Position.findOne(doc).select('-__v');

  q.exec().then(function (position){
    res.json(200, position);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function createPosition(req, res) {
  console.log("create position");
  var doc = {
    name: req.param('name'),
    abbreviation: req.param('abbreviation')
  };
  //console.log(doc);

  Position.findOne({name: doc.name }).exec().then(function (position){
    console.log("position route: ", position);
    //position doesn't exist, add to db
    if (!position) {
      // console.log("school doesn't exist, add to db!");
      return Position.create(doc);
    } else {
      return err;
    }
  }, function (err){
    console.log('Error position already exists...');
    console.error(err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (position){
    console.log(position);
    var q = Position.findOne(position);
    return q.exec();
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  }).then(function (position){
    //console.log(vote);
    res.json(201, position);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listPositions,
  show: showPosition,
  create: createPosition
};
