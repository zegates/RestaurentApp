import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  intl: Ember.inject.service('intl'),
  beforeModel(transition) {
    return this.get('intl').setLocale('en-us');
  },

  location: config.locationType
});

Router.map(function() {
  this.route('public');
  this.route('secure', function() {
    this.route('print', {
      path: 'print/:print_id'
    });
  });
});

export default Router;
