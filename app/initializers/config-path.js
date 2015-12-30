/**
 * Created by sandaruwan on 12/26/15.
 */

export function initialize(application) {
  var configPath = Ember.Object.extend({
    componentPath: {
      'add-order': 'add-order'
    }
  });

  //container.typeInjection('component');
  application.register('config-path:variables', configPath, {singleton: true});
  application.inject('component', 'config-path', 'config-path:variables');

}

export default {
  name: 'config-path',
  initialize:initialize
}


