var keystone = require('keystone')
  , Person = keystone.list('Person').model;

function listPeople(req, res){
  var doc = {}
    , q;

  q = Person.find(doc).select('-__v');

  q.exec().then(function(people){
    res.json(200, people);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function showPerson(req, res){
  var doc = { _id: req.params.id }
    , q;

  q = Person.findOne(doc).select('-__v');

  q.exec().then(function (person){
    res.json(200, person);
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

exports = module.exports = {
  list: listPeople,
  show: showPerson
};
