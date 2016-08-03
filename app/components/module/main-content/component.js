import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    addCustomer(customer) {
      console.log(customer.fname+' main content customer');
      this.sendAction('addCustomer', customer);
      this.set('customer', {});
    }
  }

});
