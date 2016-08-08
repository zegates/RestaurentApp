import Ember from 'ember';

export default Ember.Component.extend({

  customer:Ember.Object.create({}),

  actions:{
    setFoundCustomer(customer){
      Ember.set(this, 'customer', customer);
      this.sendAction('addOrderedCustomer', '');
    },
    addOrderedCustomer(customer){
      this.sendAction('addOrderedCustomer', customer);
    }
  }

});
