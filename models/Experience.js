var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Experience Model
 * ==========
 */

var Experience = new keystone.List('Experience', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'count',
  track: true
});

Experience.add({
  name: { type: Types.Text, initial: true, required: true, index: true },
  abbreviation: { type: Types.Text, initial: true, required: true, index: true },
  count: { type: Types.Number, default: 0, index: true }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
Experience.relationship({ path: 'athletes', ref: 'Athlete', refPath: 'experience' });

/**
 * Registration
 */

Experience.defaultColumns = 'name, abbreviation';
Experience.register();
