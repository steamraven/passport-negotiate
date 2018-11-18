/**
 * Module dependencies.
 */
var Strategy = require('./strategy');
var NoUserError = require('./errors/nousererror');

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports = module.exports = Strategy

exports.Strategy = Strategy;
exports.NoUserError = NoUserError;