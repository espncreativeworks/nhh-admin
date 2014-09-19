var keystone = require('keystone'),
  Timezones = keystone.list('Timezone').model,
  Types = keystone.Field.Types;

/**
 * TourStop Model
 * ==========
 */

var TourStop = new keystone.List('TourStop', {
  autokey: { path: 'slug', from: 'title', unique: true },
  map: { name: 'title' },
  defaultSort: 'stopNumber',
  defaultColumns: 'stopNumber title venue',
  track: true
});

TourStop.add({
  title: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., UCLA @ USC' },
  stopNumber: { type: Types.Number, initial: true, required: true, label: 'Number' },
  stopDate: { type: Types.Date, initial: true, label: 'Date', note: 'The date of this tour stop' },
  beginsAt: { type: Types.Datetime },
  endsAt: { type: Types.Datetime },
  timezone: { type: Types.Relationship, ref: 'Timezone', note: 'Updated automatically when venue Lat/Lng change' }
}, 'Details', {
  venue: { type: Types.Location },
  site: { type: Types.Html, wysiwyg: true, height: 120 },
  summary: { type: Types.Html, wysiwyg: true, height: 120 },
  recap: { type: Types.Html, wysiwyg: true, height: 240 },
  schools: { type: Types.Relationship, ref: 'School', many: true },
  hosts: { type: Types.Relationship, ref: 'Person', many: true },
  guests: { type: Types.Relationship, ref: 'Person', many: true }
}, 'Media', {
  thumbnailImage: { type: Types.CloudinaryImage, autoCleanup: true },
  heroImage: { type: Types.CloudinaryImage, autoCleanup: true },
  gallery: { type: Types.CloudinaryImages, autoCleanup: true },
  videos: { type: Types.Relationship, ref: 'Video', many: true, note: 'Videos from this stop' }
}, 'Meta (Used for SEO-only)', {
  pageTitle: { type: Types.Text, label: 'Page Title' },
  pageDescription: { type: Types.Textarea, label: 'Page Description' },
  pageKeywords: { type: Types.Text, label: 'Page Keywords' },
  venueUrl: { type: Types.Url, note: 'e.g., Wikipedia URL of venue, if available' }
});

/**
 * Relationships
 */


/**
 * Schema Settings
 */
TourStop.schema.pre('save', function (next){
  var self = this, q = Timezones.find(), _maxDistanceMiles = 3000 / 3959;
  if (self.isModified('venue.geo')){
    q.where('location.geo').near({
      center: self.venue.geo,
      maxDistance: _maxDistanceMiles,
      spherical: true
    }).limit(10);
    q.exec().then(function (timezones){
      self.timezone = timezones[0];
      return next();
    }, function (err){
      return next(err);
    }).end();
  } else {
    return next();
  }
});


/**
 * Registration
 */

TourStop.defaultColumns = 'stopNumber, title, venue';
TourStop.register();
