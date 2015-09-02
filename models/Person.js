var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Person Model
 * ==========
 */

var Person = new keystone.List('Person', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultSort: 'name',
  defaultColumns: 'name isTalent isHeisman',
  plural: 'People',
  searchFields: 'name pageKeywords pageDescription',
  track: true
});

Person.add({
  name: { type: Types.Name, required: true, initial: true, index: true }
}, 'Profile', {
  gender: { type: Types.Select, options: [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ] },
  title: { type: Types.Text, note: 'e.g., Anchor, Broadcaster, etc.' },
  bio: { type: Types.Html, wysiwyg: true, height: 120 },
  webpage: { type: Types.Url, note: 'e.g., Wikipedia page, IMDB page, etc.' },
  image: { type: Types.CloudinaryImage, autoCleanup: true },
  schools: { type: Types.Relationship, ref: 'School', many: true }
}, 'Status', {
  isActive: { type: Boolean, note: 'should this person should be shown to users?', index: true },
  isTalent: { type: Boolean, note: 'is this person ESPN talent?', index: true },
  isHeisman: { type: Boolean, note: 'is this a Heisman Trophy Winner', index: true }
}, 'Meta (Used for SEO-only)', {
  pageTitle: { type: Types.Text, label: 'Page Title' },
  pageDescription: { type: Types.Textarea, label: 'Page Description' },
  pageKeywords: { type: Types.Text, label: 'Page Keywords' }
});

/**
 * Relationships
 */
Person.relationship({ path: 'videos', ref: 'Video', refPath: 'people' });
Person.relationship({ path: 'tourStops', ref: 'TourStop', refPath: 'people' });

/**
 * Registration
 */
Person.register();
