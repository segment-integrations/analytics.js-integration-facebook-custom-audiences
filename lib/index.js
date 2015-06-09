/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var push = require('global-queue')('_fbq');
var reduce = require('reduce');

/**
 * Expose `FacebookCustomAudiences`.
 */

var FacebookCustomAudiences = module.exports = integration('Facebook Custom Audiences')
  .global('_fbds')
  .global('_fbq')
  .option('pixelId', '')
  .option('currency', 'USD')
  .mapping('events')
  .tag('<script src="//connect.facebook.net/en_US/fbds.js">');

/**
 * Initialize.
 *
 * @api public
 */

FacebookCustomAudiences.prototype.initialize = function() {
  var pixelId = this.options.pixelId;
  window._fbds = window._fbds || {};
  window._fbds.pixelId = pixelId;
  window._fbq = window._fbq || [];
  window._fbq.push(['track', 'PixelInitialized', {}]);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api public
 * @return {boolean}
 */

FacebookCustomAudiences.prototype.loaded = function() {
  return !!(window._fbq && Array.prototype.push !== window._fbq.push);
};

/**
 * Track.
 *
 * https://developers.facebook.com/docs/reference/ads-api/custom-audience-website#tagapi
 *
 * @api public
 * @param {Track} track
 */

FacebookCustomAudiences.prototype.track = function(track) {
  var event = track.event();
  var properties = track.properties();

  // Track event
  window._fbq.push(['track', event, properties]);
};

/**
 * Viewed product category.
 *
 * @api private
 * @param {Track} track category
 */

FacebookCustomAudiences.prototype.viewedProductCategory = function(track) {
  push('track', 'ViewContent', {
    content_ids: [String(track.category() || '')],
    content_type: 'product_group'
  });
};

/**
 * Viewed product.
 *
 * @api private
 * @param {Track} track
 */

FacebookCustomAudiences.prototype.viewedProduct = function(track) {
  push('track', 'ViewContent', {
    content_ids: [String(track.id() || track.sku() || '')],
    content_type: 'product'
  });
};

/**
 * Added product.
 *
 * @api private
 * @param {Track} track
 */

FacebookCustomAudiences.prototype.addedProduct = function(track) {
  push('track', 'AddToCart', {
    content_ids: [String(track.id() || track.sku() || '')],
    content_type: 'product'
  });
};

/**
 * Completed Order.
 *
 * @api private
 * @param {Track} track
 */

FacebookCustomAudiences.prototype.completedOrder = function(track) {
  var content_ids = reduce(track.products() || [], [], function(ret, product) {
    ret.push(product.id || product.sku || '');
    return ret;
  });
  push('track', 'Purchase', {
    content_ids: content_ids,
    content_type: 'product'
  });
};
