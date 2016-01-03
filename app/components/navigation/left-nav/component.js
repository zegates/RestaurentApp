import Ember from 'ember';

export default Ember.Component.extend({
  mainWidget:'empty-view',

  didInsertElement() {
    this.$().foundation({
      offcanvas: { close_on_click: true }
    });
  },

  actions: {
    addOrder() {
      let orderPath = this.get('config-path').componentPath['add-order'];
      this.set('mainWidget', orderPath);
    }
  },

  getMainWidget:function(){
    return this.get('mainWidget');
  }.property('mainWidget')

});
