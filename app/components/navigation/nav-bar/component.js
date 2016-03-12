import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    this.$().foundation();
  },
  actions: {
    setWidget(path) {
      let orderPanelPath = this.get('config-path').componentPath[path];
      this.sendAction('setWidget', orderPanelPath);
      //console.log(path);
    }
  }

});
