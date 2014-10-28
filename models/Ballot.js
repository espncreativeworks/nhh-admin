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
  athletes: { type: Types.Relationship, ref: 'Athlete', many: true }
}, 'Meta', {
  isActive: { type: Boolean, default: false, index: true, label: 'Current ballot?' },
  totalVotes: { type: Types.Number, default: 0, noedit: true }
});

/**
 * Relationships
 */
// Ballot.relationship({ path: 'votes', ref: 'Vote', refPath: 'ballot' });

/**
 * Registration
 */

Ballot.defaultColumns = 'title, totalVotes';
Ballot.register();
