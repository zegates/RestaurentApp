import Ember from 'ember';
import auth from 'restaurent-app/controllers/authentication';
import cms from 'restaurent-app/namespaces/cmservice';

export default Ember.Route.extend({

  beforeModel: function() {
    if(auth.authStatus === cms.AuthenticationStatus.FAIL){
      this.transitionTo('public');
    }
  },

  model() {
    return {
      attr:{
        customer:auth.customer,
        //mainWidget:'module/add-order'
      }
    };
  },

  actions: {
    addCustomer(customer) {
      console.log(customer.fname+' customer router');
      if(customer.fname && customer.lname) {
        let newPost = this.store.createRecord('customer', {
          firstName: customer.fname,
          lastName: customer.lname,
          address: customer.address,
          password: customer.password,
          createdDate: new Date()
        });
        newPost.save();
        let comet = this.get('cometd-service');
        //comet.initConnection();
        comet.subscribeChannels();
        comet.createCustomer(newPost);
      }
    }
  }
});
