var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Video Model
 * ==========
 */

var Video = new keystone.List('Video', {
  autokey: { path: 'slug', from: 'title', unique: true },
  defaultSort: 'name',
  track: true
});

Video.add({
  title: { type: Types.Text, initial: true, required: true, index: true },
  name: { type: Types.Text, initial: true, required: true, index: true },
  youtubeId: { type: Types.Text, initial: true, required: true, index: true, label: 'YouTube Video ID' },
  description: { type: Types.Text },
  category: { type: Types.Select, options: [
    { value: 'Game Openers', label: 'Game Openers' },
    { value: 'Heisman Highlights', label: 'Heisman Highlights' },
    { value: 'Heisman to Heisman', label: 'Heisman to Heisman' },
    { value: 'Behind the Scenes', label: 'Behind the Scenes' },
    { value: 'Teasers', label: 'Teasers' },
    { value: 'Heisman House Tour', label: 'Heisman House Tour' }
  ] },
  thumbnailUrl: { type: Types.Url }
}, 'Meta', {
  youtubeUrl: { type: Types.Url },
  isActive: { type: Boolean, default: true, label: 'Is this video active?' }
});

/**
 * Relationships
 */
Video.relationship({ path: 'tourStops', ref: 'TourStop', refPath: 'videos' });

/**
 * Registration
 */
Video.defaultColumns = 'name, category, isActive';
Video.register();
