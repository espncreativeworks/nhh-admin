var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Position Model
 * ==========
 */

var Position = new keystone.List('Position', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  track: true
});

Position.add({
  name: { type: Types.Text, initial: true, required: true, index: true },
  abbreviation: { type: Types.Text, initial: true, required: true, index: true }
}, 'Meta', {
  totalVotes: { type: Types.Number, default: 0, noedit: true },
  percentage: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
Position.relationship({ path: 'athletes', ref: 'Athlete', refPath: 'position' });

/**
 * Registration
 */

Position.defaultColumns = 'name, abbreviation';
Position.register();
