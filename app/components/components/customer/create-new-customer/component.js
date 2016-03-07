import Ember from 'ember';

export default Ember.Component.extend(
{
  actions: {
    addCustomer(customer) {
      console.log(customer.fname+' customer');
      this.sendAction('addCustomer', customer);
      this.set('customer', {});
    }
  }
});
