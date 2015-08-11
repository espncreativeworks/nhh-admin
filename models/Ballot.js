var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Ballot Model
 * ==========
 */

var Ballot = new keystone.List('Ballot', {
  autokey: { path: 'slug', from: 'title', unique: true },
  defaultSort: '-startedAt',
  map: { name: 'title' },
  defaultColumns: 'title isActive totalVotes',
  track: true,
  nodelete: true
});

Ballot.add({
  title: { type: Types.Text, initial: true, required: true, index: true },
  startedAt: { type: Types.Datetime, default: Date.now, label: 'Start Date' },
  endedAt: { type: Types.Datetime, default: Date.now, label: 'End Date' },
  athletes: { type: Types.Relationship, ref: 'Athlete', many: true },
  writein: { type: Types.Relationship, ref: 'Athlete', label: 'Write In', many: true }
}, 'Meta', {
  isActive: { type: Boolean, default: false, index: true, label: 'Current ballot?' },
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
// Ballot.relationship({ path: 'votes', ref: 'Vote', refPath: 'ballot' });

Ballot.schema.pre('save', function (next){
  var Athlete = keystone.list('Athlete').model
    , self = this
    , _conditions = { }
    , _update = { $set: { isActive: false } }
    , _options = { multi: true };
  
  if (self.isActive){
    Athlete.update(_conditions, _update, _options).exec().then(function (result) {
      _conditions = { _id: { $in: self.athletes } };
      _update = { $set: { isActive: true } };
      console.log(result);
      return Athlete.update(_conditions, _update, _options).exec();
    }, function (err){
      console.error(err);
      next(err);
    }).then(function (result){
      console.log(result);
      next();
    }, function (err){
      console.error(err);
      next(err);
    });
  } else {
    next();
  }
});

/**
 * Registration
 */

Ballot.defaultColumns = 'title, totalVotes';
Ballot.register();
