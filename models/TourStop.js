var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * TourStop Model
 * ==========
 */

var TourStop = new keystone.List('TourStop', {
  autokey: { path: 'slug', from: 'title', unique: true },
  defaultSort: '-tourDate',
  track: true
});

TourStop.add({
  title: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., UCLA @ USC' },
  stopDate: { type: Types.Date, initial: true, label: 'Date', note: 'The date of this tour stop' },
  stopNumber: { type: Types.Number, initial: true, required: true, label: 'Number' }
}, 'Details', {
  venue: { type: Types.Location },
  site: { type: Types.Html, wysiwyg: true, height: 120 },
  summary: { type: Types.Html, wysiwyg: true, height: 120 },
  recap: { type: Types.Html, wysiwyg: true, height: 240 },
  schools: { type: Types.Relationship, ref: 'School', many: true }
}, 'Media', {
  thumbnailImage: { type: Types.CloudinaryImage, autoCleanup: true },
  heroImage: { type: Types.CloudinaryImage, autoCleanup: true },
  gallery: { type: Types.CloudinaryImages, autoCleanup: true },
  videos: { type: Types.Relationship, ref: 'Video', many: true, note: 'Videos from this stop' }
}, 'Meta (Used for SEO-only)', {
  pageTitle: { type: Types.Text, label: 'Page Title' },
  pageDescription: { type: Types.Textarea, label: 'Page Description' },
  pageKeywords: { type: Types.Text, label: 'Page Keywords' }
});

/**
 * Relationships
 */


/**
 * Registration
 */

TourStop.defaultColumns = 'stopNumber, title, venue';
TourStop.register();
