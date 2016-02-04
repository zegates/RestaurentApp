import Ember from 'ember';
/**
 * Created by Sandaruwan on 12/26/15.
 */

export function initialize(application) {
  var configPath = Ember.Object.extend({
    componentPath: {
      'order-panel': 'components/order/add-order',
      'customer-panel':'components/customer/customer-panel'
    }
  });

  //container.typeInjection('component');
  application.register('config-path:variables', configPath, {singleton: true});
  application.inject('component', 'config-path', 'config-path:variables');

}

export default {
  name: 'config-path',
  initialize:initialize
};


