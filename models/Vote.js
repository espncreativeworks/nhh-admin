var keystone = require('keystone')
  , Types = keystone.Field.Types
  , Athlete = keystone.list('Athlete')
  , Ballot = keystone.list('Ballot')
  , IpAddress = keystone.list('IpAddress')
  , UserAgent = keystone.list('UserAgent')
  , OperatingSystem = keystone.list('OperatingSystem')
  , Device = keystone.list('Device');
  //, util = require('util');

/**
 * Vote Model
 * ==========
 */

var Vote = new keystone.List('Vote', {
  defaultSort: '-submittedAt',
  noedit: true,
  nocreate: true,
  nodelete: true
});

Vote.add({
  ballot: { type: Types.Relationship, ref: 'Ballot', required: true, initial: true },
  athlete: { type: Types.Relationship, ref: 'Athlete', required: true, initial: true }
}, 'Meta', {
  submittedAt: { type: Types.Datetime, default: Date.now },
  medium: { type: Types.Select, numeric: true, required: true, initial: true, options: [
    { value: 1, label: 'Desktop' },
    { value: 2, label: 'Mobile' },
    { value: 3, label: 'Ad Unit' },
    { value: 4, label: 'On-site' }
  ] },
  ipAddress: { type: Types.Relationship, ref: 'IpAddress' },
  userAgent: { type: Types.Relationship, ref: 'UserAgent' },
  operatingSystem: { type: Types.Relationship, ref: 'OperatingSystem' },
  device: { type: Types.Relationship, ref: 'Device' }
});

/**
 * Schema Settings
 */

// Update Meta fields
Vote.schema.post('save', function (doc){
  //console.info('[Vote.post(\'save\')] Start!');
  //console.log(util.inspect(this));

  var athleteId = this.athlete
    , ballotId = this.ballot
    , ipAddressId = this.ipAddress
    , userAgentId = this.userAgent
    , operatingSystemId = this.operatingSystem
    , deviceId = this.device
    , ballotUpdateQ
    , athleteUpdateQ
    , ipAddressUpdateQ
    , userAgentUpdateQ
    , operatingSystemUpdateQ
    , deviceUpdateQ
    , update = { $inc: { totalVotes: 1 } }
    , options = { select: 'totalVotes' };

  ballotUpdateQ = Ballot.model.findOneAndUpdate({ _id: ballotId }, update, options).exec();
  athleteUpdateQ = Athlete.model.findOneAndUpdate({ _id: athleteId }, update, options);
  ipAddressUpdateQ = IpAddress.model.findOneAndUpdate({ _id: ipAddressId }, update, options);
  userAgentUpdateQ = UserAgent.model.findOneAndUpdate({ _id: userAgentId }, update, options);
  operatingSystemUpdateQ = OperatingSystem.model.findOneAndUpdate({ _id: operatingSystemId }, update, options);
  deviceUpdateQ = Device.model.findOneAndUpdate({ _id: deviceId }, update, options);

  ballotUpdateQ.then(function (ballot){
    return athleteUpdateQ.exec(); // increment athlete totalVotes
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from ballot update...');
    console.error(err);
  }).then(function (athlete){
    return ipAddressUpdateQ.exec(); // increment ipAddress totalVotes
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from update athlete...');
    console.error(err);
  }).then(function (ipAddress){
    return userAgentUpdateQ.exec(); // increment userAgent totalVotes
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from update ipAddress...');
    console.error(err);
  }).then(function (userAgent){
    return operatingSystemUpdateQ.exec(); // increment os totalVotes
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from update userAgent...');
    console.error(err);
  }).then(function (os){
    return deviceUpdateQ.exec();
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from update operatingSystem...');
    console.error(err);
  }).then(function (device){
    return doc;
  }, function (err){
    console.error('[Vote.post(\'save\')] Error from update device...');
    console.error(err);
  });

});

/**
 * Registration
 */

Vote.defaultColumns = 'submittedAt, medium';
Vote.register();
