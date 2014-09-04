var keystone = require('keystone')
  , _ = require('underscore')
  , Types = keystone.Field.Types
  , Athlete = keystone.list('Athlete')
  , Ballot = keystone.list('Ballot')
  , Position = keystone.list('Position')
  , Experience = keystone.list('Experience')
  , School = keystone.list('School')
  , util = require('util');

/**
 * Vote Model
 * ==========
 */

var Vote = new keystone.List('Vote', {
  defaultSort: '-submittedAt',
  noedit: true,
  nocreate: true,
  nodelete: true
});

Vote.add({
  ballot: { type: Types.Relationship, ref: 'Ballot', required: true, initial: true },
  athlete: { type: Types.Relationship, ref: 'Athlete', required: true, initial: true }
}, 'Meta', {
  submittedAt: { type: Types.Datetime, default: Date.now },
  medium: { type: Types.Select, numeric: true, required: true, initial: true, options: [
    { value: 1, label: 'Desktop' },
    { value: 2, label: 'Mobile' },
    { value: 3, label: 'Ad Unit' },
    { value: 4, label: 'On-site' }
  ] }
});

/**
 * Schema Settings
 */

// Update Meta fields
Vote.schema.post('save', function (next){
  console.info('[Vote.post(\'save\')] Start!');
  console.log(util.inspect(this));

  var athleteId = this.athlete
    , ballotId = this.ballot
    , positionId
    , experienceId
    , schoolId
    , ballotUpdateQ
    , ballotFindAllQ
    , athleteFindOneQ
    , athleteUpdateQ
    , update = { $inc: { totalVotes: 1 } }
    , options = { select: 'totalVotes' }
    , ballotsTotal
    , athleteTotal
    , positionTotal
    , experienceTotal
    , schoolTotal;

  ballotUpdateQ = Ballot.model.findOneAndUpdate({ _id: ballotId }, update, options).exec();
  ballotFindAllQ = Ballot.model.find().select('totalVotes');
  athleteFindOneQ = Athlete.model.findOne({ _id: athleteId });
  athleteFindOneQ
    .populate('position')
    .populate('experience')
    .populate('school');
  athleteUpdateQ = Athlete.model.findOneAndUpdate({ _id: athleteId }, update, options);
  ballotsTotal = 0;
  athleteTotal = 0;
  ballotUpdateQ.then(function (ballot){
    console.log(ballot);
    return ballotFindAllQ.exec(); // find all ballots
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from ballot update...');
    console.error(err);
    next(err);
  }).then(function (ballots){
    console.log(ballots);
    ballots.forEach(function (b){
      ballotsTotal += b.totalVotes;
    });
    return athleteUpdateQ.exec();
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from ballot find all...');
    console.error(err);
    next(err);
  }).then(function (athlete){
    console.log(athlete);
    athleteTotal = athlete.totalVotes;
    var _update = { $set: { percentage: 0 } }
      , _options = _.extend({ }, options);
    _options.select = _options.select + ' percentage';
    if ( ballotsTotal > 0 ){
      _update.$set.percentage = athleteTotal / ballotsTotal;
    }
    return Athlete.model.findOneAndUpdate({ _id: athleteId }, _update, _options).exec();
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from athlete update...');
    console.error(err);
    next(err);
  }).then(function (athlete){
    console.log(athlete);
    return athleteFindOneQ.exec();
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from athlete set...');
    console.error(err);
    next(err);
  }).then(function (athlete){
    console.log(athlete);
    var _updateTotalVotes = { $inc: { totalVotes: 1 } }
      , _updatePercentage = { $set: { percentage: 0 } }
      , _positionUpdate = _.extend({}, _updatePercentage)
      , _experienceUpdate = _.extend({}, _updatePercentage)
      , _schoolUpdate = _.extend({}, _updatePercentage)
      , _options = _.extend({ }, options)
      , q;

    positionId = athlete.position._id;
    experienceId = athlete.experience._id;
    schoolId = athlete.school._id;
    _options.select = _options.select + ' percentage';

    q = Position.model.findOneAndUpdate({ _id: positionId }, _updateTotalVotes, _options).exec();
    return q.then(function(position){
      console.log(position);
      positionTotal = position.totalVotes;
      if ( ballotsTotal > 0 ){
        _positionUpdate.$set.percentage = positionTotal / ballotsTotal;
      }
      return Position.model.findOneAndUpdate({ _id: positionId }, _positionUpdate, _options).exec();
    }).then(function (position){
      console.log(position);
      return School.model.findOneAndUpdate({ _id: schoolId }, _updateTotalVotes, _options).exec();
    }).then(function (school){
      console.log(school);
      schoolTotal = school.totalVotes;
      if ( ballotsTotal > 0 ){
        _schoolUpdate.$set.percentage = schoolTotal / ballotsTotal;
      }
      return School.model.findOneAndUpdate({ _id: schoolId }, _schoolUpdate, _options).exec();
    }).then(function (school){
      console.log(school);
      return Experience.model.findOneAndUpdate({ _id: experienceId }, _updateTotalVotes, _options).exec();
    }).then(function (experience){
      console.log(experience);
      experienceTotal = experience.totalVotes;
      if ( ballotsTotal > 0 ){
        _experienceUpdate.$set.percentage = experienceTotal / ballotsTotal;
      }
      return Experience.model.findOneAndUpdate({ _id: experienceId }, _experienceUpdate, _options).exec();
    });
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from athlete findOne...');
    console.error(err);
    next(err);
  }).then(function (experience){
    console.log(experience);
    console.info('[Vote.post(\'save\')] Complete!');
    next();
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from position / experience / school update...');
    console.error(err);
    next(err);
  });
});

/**
 * Registration
 */

Vote.defaultColumns = 'submittedAt, medium';
Vote.register();
