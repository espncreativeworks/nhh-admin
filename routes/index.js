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
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var _ = require('underscore'),
	keystone = require('keystone'),
	middleware = require('./middleware'),
	importRoutes = keystone.importer(__dirname);

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

	// Views
	app.get('/', routes.views.index);

	// API

	// votes
	app.get('/api/votes', routes.api.votes.list);
	app.post('/api/votes', routes.api.votes.create);
	app.get('/api/votes/:id', routes.api.votes.show);

	// ballots
	app.get('/api/ballots', routes.api.ballots.list);
	app.get('/api/ballots/:id', routes.api.ballots.show);

	// athletes
	app.get('/api/athletes', routes.api.athletes.list);
	app.get('/api/athletes/:id', routes.api.athletes.show);

	// tour stops
	app.get('/api/videos', routes.api.videos.list);
	app.get('/api/videos/:id', routes.api.videos.show);

	// tour stops
	app.get('/api/tour-stops', routes.api.tourStops.list);
	app.get('/api/tour-stops/:id', routes.api.tourStops.show);

	// schools
	app.get('/api/schools', routes.api.schools.list);
	app.get('/api/schools/:id', routes.api.schools.show);

	// positions
	app.get('/api/positions', routes.api.positions.list);
	app.get('/api/positions/:id', routes.api.positions.show);

	// experiences
	app.get('/api/experiences', routes.api.experiences.list);
	app.get('/api/experiences/:id', routes.api.experiences.show);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
