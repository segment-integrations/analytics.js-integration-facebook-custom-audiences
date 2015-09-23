
var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var FacebookCustomAudiences = require('../lib/');

describe('Facebook Custom Audiences', function() {
  var analytics;
  var facebook;
  var options = {
    pixelId: '216411418569295',
    events: { 'conversion-event': 1293871928 }
  };

  beforeEach(function() {
    analytics = new Analytics();
    facebook = new FacebookCustomAudiences(options);
    analytics.use(FacebookCustomAudiences);
    analytics.use(tester);
    analytics.add(facebook);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    facebook.reset();
    sandbox();
  });

  it('should have the correct settings', function() {
    analytics.compare(FacebookCustomAudiences, integration('Facebook Custom Audiences')
      .global('_fbds')
      .global('_fbq')
      .option('pixelId', '')
      .option('currency', 'USD')
      .mapping('events'));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(facebook, 'load');
    });

    afterEach(function() {
      facebook.reset();
    });

    describe('#initialize', function() {
      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(facebook.load);
      });
    });

    describe('#loaded', function() {
      it('should return `true` if window._fbq inited', function() {
        analytics.assert(!facebook.loaded());
        window._fbds = {};
        analytics.assert(!facebook.loaded());
        window._fbq = [];
        window._fbq.push = function() {};
        analytics.assert(facebook.loaded());
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(facebook, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window._fbq, 'push');
      });

      it('should send event', function() {
        analytics.track('event');
        analytics.called(window._fbq.push, ['track', 'event', {}]);
      });

      it('should send properties', function() {
        analytics.track('event', { revenue: 50.99, lala: true, tobi: 'lovableferret' });
        analytics.called(window._fbq.push, ['track', 'event', {
          revenue: 50.99,
          lala: true,
          tobi: 'lovableferret'
        }]);
      });

      it('should send ecommerce event - Viewed Product Category', function() {
        analytics.track('Viewed Product Category', { category: 'Games' });
        analytics.called(window._fbq.push, ['track', 'ViewContent', {
          content_ids: ['Games'],
          content_type: 'product_group'
        }]);
      });

      it('should send ecommerce event - Viewed Product', function() {
        analytics.track('Viewed Product', {
          id: '507f1f77bcf86cd799439011',
          currency: 'USD',
          value: 0.50,
          quantity: 1,
          price: 24.75,
          name: 'my product',
          category: 'cat 1',
          sku: 'p-298'
        });
        analytics.called(window._fbq.push, ['track', 'ViewContent', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'product',
          content_name: 'my product',
          content_category: 'cat 1',
          currency: 'USD',
          value: 0.50
        }]);
      });

      it('should send ecommerce event - Adding to Cart', function() {
        analytics.track('Added Product', {
          id: '507f1f77bcf86cd799439011',
          currency: 'USD',
          value: 0.50,
          quantity: 1,
          price: 24.75,
          name: 'my product',
          category: 'cat 1',
          sku: 'p-298'
        });
        analytics.called(window._fbq.push, ['track', 'AddToCart', {
          content_ids: ['507f1f77bcf86cd799439011'],
          content_type: 'product',
          content_name: 'my product',
          content_category: 'cat 1',
          currency: 'USD',
          value: 0.50
        }]);
      });

      it('should send ecommerce event - Completing an Order', function() {
        analytics.track('Completed Order', {
          products: [
            { id: '507f1f77bcf86cd799439011' },
            { id: '505bd76785ebb509fc183733' }
          ],
          currency: 'USD',
          value: 0.50
        });
        analytics.called(window._fbq.push, ['track', 'Purchase', {
          content_ids: ['507f1f77bcf86cd799439011', '505bd76785ebb509fc183733'],
          content_type: 'product',
          currency: 'USD',
          value: 0.50
        }]);
      });
    });
  });
});
