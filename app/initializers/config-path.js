import Ember from 'ember';
/**
 * Created by Sandaruwan on 12/26/15.
 */

export function initialize(application) {
  var configPath = Ember.Object.extend({
    componentPath: {
      'order-panel': {
        widget:'components/order/add-order',
        title:'Add Order'
      },
      'customer-panel':{
        widget:'components/customer/customer-panel',
        title:'Customer Details'
      },
      'search-customer':{
        widget:'components/customer/search-customer/',
        title:'Order Panel Customer Details'
      }
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


