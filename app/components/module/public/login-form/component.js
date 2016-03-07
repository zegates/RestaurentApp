import Ember from 'ember';
import auth from 'restaurent-app/controllers/authentication';

export default Ember.Component.extend({

  //init(){
  //  this._super();
  //
  //},

  actions: {
    login(customer) {
      console.log('customer '+ customer.username);
      this.sendAction('login', customer);
    }
  }

});
