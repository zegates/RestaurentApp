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
      this.sendAction('setWidget', orderPath);
      console.log('cant sret');

    },
    customerPanel(){
      let customerPanel = this.get('config-path').componentPath['customer-panel'];
      this.set('mainWidget', customerPanel);
      this.sendAction('setWidget', customerPanel);
    },

    addCustomer(customer) {
      console.log(customer.fname+' customer');
      this.sendAction('addCustomer', customer);
      this.set('customer', {});
    }
  },


  getMainWidget:function(){
    return this.get('mainWidget');
  }.property('mainWidget')

});
