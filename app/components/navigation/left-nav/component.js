import Ember from 'ember';

export default Ember.Component.extend({

  didInsertElement() {
    this.$().foundation({
      offcanvas: { close_on_click: true }
    });
  },

  actions: {
    setWidget(path) {
      let orderPanelPath = this.get('config-path').componentPath[path];
      this.sendAction('setWidget', orderPanelPath);
      //console.log(path);
    },
    addCustomer(customer) {
      console.log(customer.fname+' customer');
      this.sendAction('addCustomer', customer);
      this.set('customer', {});
    }
  }
});
