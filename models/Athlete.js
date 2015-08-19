var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Athlete Model
 * ==========
 */

var Athlete = new keystone.List('Athlete', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  drilldown: 'school position experience',
  defaultColumns: 'isActive name totalVotes',
  track: true
});

Athlete.add({
  espnId: { type: Types.Key, initial: true, required: true, index: true, label: 'ESPN ID' },
  name: { type: Types.Name, initial: true, required: true, index: true },
  jersey: { type: Types.Number, initial: true, required: true, index: true },
  experience: { type: Types.Relationship, ref: 'Experience' },
  position: { type: Types.Relationship, ref: 'Position' },
  school: { type: Types.Relationship, ref: 'School' }
}, 'Meta', {
  isActive: { type: Boolean, default: false, index: true, label: 'On ballot?' },
  isWritein: { type: Boolean, default: false, index: true, label: 'Write In Nominee?' },
  isIntroduction: { type: Boolean, default: false, index: true, label: 'New candidate?' },
  isReturning: { type: Boolean, default: false, index: true, label: 'Returning after absence?' },
  introducedOn:  { type: Types.Date, note: 'The date when the player was first included on the Heisman Watch' },
  lastAppearedOn:  { type: Types.Date, note: 'The date when the player was last included on the Heisman Watch' },
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
// Athlete.relationship({ path: 'votes', ref: 'Vote', refPath: 'athlete' });

/**
 * Registration
 */

Athlete.defaultColumns = 'name, position, school, votes';
Athlete.register();
