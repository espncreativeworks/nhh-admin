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
  url: { type: Types.Url, note: 'e.g., Wikipedia URL, if available' }
});

/** Schema Settings */
// Update Meta fields
// School.schema.post('save', function (doc){
//   console.info('[School.post(\'save\')] Start!');
//   // console.log(util.inspect(this));
//   console.log("School.post this: ", this);

//   var espnId = this.espnId
//       , name = this.name
//       , abbreviation = this.abbreviation
//       , primaryColor = this.primaryColor
//       , secondaryColor = null
//       , schoolUpdateQ

//   schoolUpdateQ = School.model.findOne({'name': name}).exec();

//   schoolUpdateQ.then(function (school){
//     console.log("school model: ", school);
//     if (!school) {
//       console.log("school doesn't exist");
//     } else {
//       console.log("else school model: ", school);
//     }
//   }, function (err){
//     console.error('[School.post(\'save\')] Error from school update...');
//     console.error(err);
//   });

// });

/**
 * Relationships
 */
School.relationship({ path: 'athletes', ref: 'Athlete', refPath: 'school' });
School.relationship({ path: 'people', ref: 'Person', refPath: 'schools' });
School.relationship({ path: 'tourStops', ref: 'TourStop', refPath: 'schools' });

/**
 * Registration
 */
School.defaultColumns = 'name, abbreviation';
School.register();
