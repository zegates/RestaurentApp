import Ember from 'ember';

export default Ember.Component.extend({

  customer:Ember.Object.create({}),

  actions:{
    setFoundCustomer(customer){
      Ember.set(this, 'customer', customer)
    }
  }

});
