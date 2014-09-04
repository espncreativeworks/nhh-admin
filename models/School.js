var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * School Model
 * ==========
 */

var School = new keystone.List('School', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  track: true
});

School.add({
  espnId: { type: Types.Key, initial: true, required: true, index: true, label: 'ESPN ID' },
  name: { type: Types.Text, initial: true, required: true, index: true },
  abbreviation: { type: Types.Text, initial: true, required: true, index: true },
  primaryColor: { type: Types.Color, initial: true, required: true },
  secondaryColor: { type: Types.Color }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true },
  percentage: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
School.relationship({ path: 'athletes', ref: 'Athlete', refPath: 'school' });

/**
 * Registration
 */
School.defaultColumns = 'name, abbreviation';
School.register();
