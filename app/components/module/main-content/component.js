import Ember from 'ember';
import secureRoute from 'restaurent-app/routes/secure';

export default Ember.Component.extend({

  actions: {
    addCustomer(customer) {
      console.log(customer.fname+' main content customer');
      this.sendAction('addCustomer', customer);
      this.set('customer', {});
    }
  }

});
