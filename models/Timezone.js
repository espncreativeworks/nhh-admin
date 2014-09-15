var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Timezone Model
 * ==========
 */

var Timezone = new keystone.List('Timezone', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  noedit: true,
  nocreate: true,
  nodelete: true,
  track: true
});

Timezone.add({
  name: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., America/New_York' },
  lat: { type: Types.Number, initial: true, required: true, label: 'Latitude', note: 'e.g., 40.7142' },
  'long': { type: Types.Number, initial: true, required: true, label: 'Longitude', note: 'e.g., -73.9936' },
  country: { type: Types.Text, initial: true, required: true, index: true, note: 'e.g., US' },
  comments: { type: Types.Text, note: 'e.g., Eastern Time' },
  location: { type: Types.Location }
});

/**
 * Relationships
 */
Timezone.relationship({ path: 'tourStops', ref: 'TourStop', refPath: 'timezone' });

/**
 * Schema Settings
 */
Timezone.schema.pre('save', function (next) {

  if (!this.location.geo || this.location.geo.length !== 2) {
    this.location.geo = [this['long'], this.lat];
  }

  if (!this.location.country){
    this.location.country = this.country;
  }

  next();
});

/**
 * Registration
 */

Timezone.defaultColumns = 'name, country, comments';
Timezone.register();
