var keystone = require('keystone')
  , ObjectId = keystone.mongoose.Types.ObjectId
  , Ballot = keystone.list('Ballot').model
  , Athlete = keystone.list('Athlete').model
  , Vote = keystone.list('Vote').model
  , School = keystone.list('School').model
  , Experience = keystone.list('Experience').model
  , Position = keystone.list('Position').model
  , IpAddress = keystone.list('IpAddress').model
  , UserAgent = keystone.list('UserAgent').model
  , OperatingSystem = keystone.list('OperatingSystem').model
  , Device = keystone.list('Device').model
  , Q = require('q')
  , request = require('request')
  , useragent = require('useragent')
  , _ = require('underscore')
  , unirest = require('unirest');

useragent(true);

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
      'ballot': '-__v',
      'ipAddress': '-__v',
      'userAgent': '-__v',
      'os': '-__v',
      'device': '-__v'
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
    medium: req.param('medium'),
    ipAddress: req.param('ipAddress') || req.ip || req.ips[0] || null,
    userAgent: req.param('userAgent') || req.get('User-Agent') || null,
    operatingSystem: null,
    device: null
  }; 

  // console.log("createVote: ", doc);

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
    return res.json(400, err);
  }

  Ballot.findOne({ _id: doc.ballot }).exec().then(function (ballot){
    //console.log(ballot);
    var isValidAthlete = false;

    // return early if ballot does not exist or is inactive
    if (!ballot || !ballot.isActive){
      err = new Error('Invalid Ballot');
      err.message = 'Ballot ' + doc.ballot + ' is inactive';
      throw err;
    }

    // check for existence of submitted athleteId in ballot.athletes
    //console.log(ballot.athletes[0].toString());
    ballot.athletes.forEach(function (_athleteId){
      if (_athleteId.toString() === doc.athlete.toString()){
        isValidAthlete = true;
      }
    });
    // check for existence of write in nominee
    ballot.writein.forEach(function (_athleteId){
      //console.log(_athleteId + ", " + doc.athlete);
      if (_athleteId.toString() === doc.athlete.toString()){
        isValidAthlete = true;
      }
    });

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
    // console.log(doc);
    // console.log("vote api: ", athlete);

    // return early if athlete does not exist
    // make inactive athlete active for write-in ballot
    if (!athlete) {
      err = new Error('Invalid Athlete');
      err.message = 'Athlete ' + doc.athlete + ' is inactive.';
      throw err;
    } else if (!athlete.isActive) {
      athlete.isActive = true;
      
      if(!athlete.isWritein) {
        athlete.isWritein = true;
      }
    }

    console.log("athlete: ", athlete);

    return IpAddress.findOne({ address: doc.ipAddress }).exec();
  }, function (err){
    console.log("athlete findone error: ", err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (ipAddress){
    console.log("ipAddress: ", ipAddress);
    var deferred = Q.defer();
    if (!ipAddress){
      getIpGeolocation(doc.ipAddress).then(function (_ip){
        var _doc = {
          address: _ip.ip,
          location: {
            suburb: _ip.city || '',
            state: _ip.region_code || '',
            postcode: _ip.postal_code || '',
            country: _ip.country_code || '',
            geo: [ _ip.longitude, _ip.latitude ]
          }
        };
        console.log("getipgeoloc: ", _doc);
        return IpAddress.create(_doc);
      }, function (err){
        console.error('Error from getIpGeolocation( ' + doc.ipAddress + ' )');
        deferred.reject(err);
      }).then(function (ipAddress){
        // console.log("findone ipaddres: ", ipAddress);
        doc.ipAddress = ipAddress._id;
        deferred.resolve(doc);
      }, function (err){
        console.error('Error from IpAddress.create() ...');
        deferred.reject(err);
      });
    } else {
      if (ipAddress.isBlacklisted){
        console.error('Rejecting blacklisted IP Address [' + ipAddress.address + '] ...');
        var err = new Error('Invalid IP Address');
        err.message = 'IP Address ' + ipAddress.address + ' is invalid.';
        deferred.reject(err);
      } else {
        doc.ipAddress = ipAddress._id;
        deferred.resolve(doc);
      }
    }
    return deferred.promise;
  }, function (err){
    console.error('Error from IpAddress.findOne() ... ', err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (doc){
    var deferred = Q.defer()
      , _uaDeferred = Q.defer()
      , _osDeferred = Q.defer()
      , _deviceDeferred = Q.defer()
      , agent = useragent.lookup(doc.userAgent)
      // , _userAgent = _.extend({}, agent)
      // , _operatingSystem = _.extend({}, agent.os)
      // , _device = _.extend({}, agent.device);
      , _userAgent = agent
      , _operatingSystem = agent.os
      , _device = agent.device;

    // console.log("UA: ", agent);

    UserAgent.findOne(_userAgent).exec().then(function (ua){
      if (!ua){
        UserAgent.create(_userAgent).then(function (userAgent){
          doc.userAgent = userAgent._id;
          _uaDeferred.resolve(doc);
        }, function (err){
          console.log('Error creating userAgent...');
          _uaDeferred.reject(err);
        });
      } else {
        doc.userAgent = ua._id;
        _uaDeferred.resolve(doc);
      }
      return _uaDeferred.promise;
    }, function (err){
      console.log('Error finding userAgent...');
      deferred.reject(err);
    }).then(function(doc){
      OperatingSystem.findOne(_operatingSystem).exec().then(function (os){
        if (!os){
          OperatingSystem.create(_operatingSystem).then(function (operatingSystem){
            doc.operatingSystem = operatingSystem._id;
            _osDeferred.resolve(doc);
          }, function (err){
            console.log('Error creating operating system...');
            console.error(err);
            _osDeferred.reject(err);
          });
        } else {
          doc.operatingSystem = os._id;
          _osDeferred.resolve(doc);
        }
      }, function (err){
        console.log('Error finding operating system...');
        console.error(err);
        _osDeferred.reject(err);
      });
      return _osDeferred.promise;
    }, function (err){
      console.log('Error creating userAgent');
      console.error(err);
      deferred.reject(err);
    }).then(function (doc){
      Device.findOne(_device).exec().then(function (__device){
        if (!__device){
          Device.create(_device).then(function (device){
            doc.device = device._id;
            _deviceDeferred.resolve(doc);
          }, function (err){
            console.log('Error creating device...');
            console.error(err);
            _deviceDeferred.reject(err);
          });
        } else {
          doc.device = __device._id;
          _deviceDeferred.resolve(doc);
        }
      }, function (err){
        console.log('Error finding device...');
        console.error(err);
        _deviceDeferred.reject(err);
      });
      return _deviceDeferred.promise;
    }, function (err){
      console.log('Error creating operating system...');
      console.error(err);
      deferred.reject(err);
    }).then(function (doc){
      deferred.resolve(doc);
    }, function (err){
      console.log('Error creating device...');
      console.error(err);
      deferred.reject(err);
    });

    return deferred.promise;

  }, function (err){
    console.log('Error finding or creating ipAddress...');
    console.error(err);
  }).then(function (doc){
    console.log("before vote create: ", doc);
    return Vote.create(doc);
  }, function (err){
    console.log('Error finding or creating userAgent, operatingSystem or device...');
    console.error(err);
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    console.log("vote created: ", vote);
    var q = Vote.findOne(vote);
    q.populate('athlete', '_id name espnId slug totalVotes');
    q.populate('writein', '_id name espnId slug totalVotes');
    q.populate('ballot', '_id totalVotes');
    console.log("q.exec: ",q.exec());
    return q.exec();
  }, function (err){
    console.log("error vote.findone()");
    res.json(500, { name: err.name, message: err.message });
  }).then(function (vote){
    console.log("vote: ", vote);
    res.json(201, vote);
  }, function (err){
    console.log("error showing vote");
    res.json(500, { name: err.name, message: err.message });
  });
}

function showVote(req, res){
  // console.log("req.params: ", req.parms);
  var q = Vote.findOne({ _id: req.params.id });

  q.populate('athlete', 'name _id espnId');
  q.populate('writein', 'name _id espnId');
  q.populate('ballot', '_id totalVotes');
  q.populate('ipAddress', 'address location');
  q.populate('userAgent', 'family major minor patch');
  q.populate('operatingSystem', 'family major minor patch');
  q.populate('device', 'family major minor patch');

  q.exec().then(function (vote){
    if (vote){
      console.log("show vote: ", vote);
      res.json(200, vote);
    } else {
      res.json(404, { name: 'Not Found', message: 'No vote found for :' + req.params.id });
    }
  }, function (err){
    res.json(500, { name: err.name, message: err.message });
  });
}

function getIpGeolocation(ip){
  var deferred = Q.defer()
    // , baseUrl = 'http://www.telize.com/geoip/'
    // , baseUrl = 'https://telize-v1.p.mashape.com/geoip/'
    // , _url = baseUrl + ip + '?callback=getgeoip';
    , baseUrl = 'https://telize-v1.p.mashape.com/geoip'
    , _url = baseUrl + ip;

  // These code snippets use an open-source library. http://unirest.io/nodejs
  // unirest.get("https://telize-v1.p.mashape.com/jsonip?callback=getip")
  // .header("X-Mashape-Key", )
  // .header("Accept", "application/json")
  // .end(function (result) {
  //   console.log(result.status, result.headers, result.body);
  // });

  var opts = {
    method: 'GET',
    url: _url,
    headers: { 'X-Mashape-Key': 'h2MRbZxrlomshx7OBm8bSs1GUrSyp17Pc2ujsnXgCFkinAtbyr', 'Accept': 'application/json' }
  };

  request(opts, function (err, response, body){
    // console.log("getipgeoloc response: ", response);
    if (err){
      // console.log("getipgeoloc err: ", err);
      return deferred.reject(err);
    }
    // console.log("func getipgeoloc: ", body);
    return deferred.resolve(JSON.parse(body));
  });

  return deferred.promise;
}

exports = module.exports = {
  list: listVotes,
  create: createVote,
  show: showVote
};

// function setHeader(xhr) {
//   xhr.setRequestHeader('X-Mashape-Key', '');
//   xhr.setRequestHeader('Accept', 'application/json');
// }
