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
    , ballotUpdateQ
    , athleteUpdateQ
    , update = { $inc: { totalVotes: 1 } }
    , options = { select: 'totalVotes' };

  ballotUpdateQ = Ballot.model.findOneAndUpdate({ _id: ballotId }, update, options).exec();
  athleteUpdateQ = Athlete.model.findOneAndUpdate({ _id: athleteId }, update, options);

  ballotUpdateQ.then(function (ballot){
    console.log(ballot);
    return athleteUpdateQ.exec(); // increment athlete totalVotes
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from ballot update...');
    console.error(err);
    next(err);
  }).then(function (athlete){
    console.log(athlete);
    console.info('[Vote.post(\'save\')] Complete!');
    next();
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from update athlete...');
    console.error(err);
    next(err);
  });
});

/**
 * Registration
 */

Vote.defaultColumns = 'submittedAt, medium';
Vote.register();
