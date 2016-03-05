export function initialize(application) {
  let activeMainWidget =Ember.Object.extend({
    centerWidget: ''
  });
  //application.register('activeMainWidget:variables', activeMainWidget, {singleton: true});
  //application.inject('route', 'widgets', 'activeMainWidget:variables');
  //application.inject('component', 'widgets', 'activeMainWidget:variables');
}

export default {
  name: 'widget-config',
  initialize: initialize
};
