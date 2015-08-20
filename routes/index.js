/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var _ = require('underscore'),
	keystone = require('keystone'),
	middleware = require('./middleware'),
	importRoutes = keystone.importer(__dirname),
	cors = require('cors');

// var whitelist = [
// 	'http://promo.espn.go.com',
// 	'http://promo-qa.espn.go.com',
// 	'http://preview.espncreativeworks.com',
// 	'http://vwtsbar04.corp.espn3.com:3467',
// 	'http://localhost:9000',
// 	'http://0.0.0.0:9000'
// ];

// var corsOptionsDelegate = function(req, callback){
//   var corsOptions;
//   if (whitelist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false }; // disable CORS for this request
//   }
//   callback(null, corsOptions); // callback expects two parameters: error and options
// };

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api')
};

// Setup Route Bindings
exports = module.exports = function(app) {
	if (process.env.NODE_ENV !== 'production'){
		app.options('*', cors());
		app.all('*', cors());
		app.use(cors());
	}

	// console.log("app: ", app);

	// API
	// votes
	app.get('/api/votes', routes.api.votes.list);
	app.post('/api/votes', routes.api.votes.create);
	app.get('/api/votes/:id', routes.api.votes.show);

	// ballots
	app.get('/api/ballots', routes.api.ballots.list);
	app.post('/api/ballots', routes.api.ballots.create);
	app.get('/api/ballots/:id', routes.api.ballots.show);

	// athletes
	app.get('/api/athletes', routes.api.athletes.list);
	app.post('/api/athletes', routes.api.athletes.create);
	app.get('/api/athletes/:id', routes.api.athletes.show);

	// tour stops
	app.get('/api/videos', routes.api.videos.list);
	app.get('/api/videos/:id', routes.api.videos.show);

	// tour stops
	app.get('/api/tour-stops', routes.api.tourStops.list);
	app.get('/api/tour-stops/:id', routes.api.tourStops.show);

	// schools
	app.get('/api/schools', routes.api.schools.list);
	app.post('/api/schools', routes.api.schools.create);
	app.get('/api/schools/:id', routes.api.schools.show);

	// positions
	app.get('/api/positions', routes.api.positions.list);
	app.post('/api/positions', routes.api.positions.create);
	app.get('/api/positions/:id', routes.api.positions.show);

	// links
	app.post('/api/links/shorten', routes.api.links.shorten);

	// timezones
	app.get('/api/timezones', routes.api.timezones.list);
	app.get('/api/timezones/:id', routes.api.timezones.show);

	// people
	app.get('/api/people', routes.api.people.list);
	app.get('/api/people/:id', routes.api.people.show);

	// ip addresses
	app.get('/api/ip-addresses', routes.api.ipAddresses.list);
	app.get('/api/ip-addresses/:id', routes.api.ipAddresses.show);

	// user agents
	app.get('/api/user-agents', routes.api.userAgents.list);
	app.get('/api/user-agents/:id', routes.api.userAgents.show);

	// operating systems
	app.get('/api/operating-systems', routes.api.operatingSystems.list);
	app.get('/api/operating-systems/:id', routes.api.operatingSystems.show);

	// devices
	app.get('/api/devices', routes.api.devices.list);
	app.get('/api/devices/:id', routes.api.devices.show);


	// Views
	app.get('/', routes.views.index);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
