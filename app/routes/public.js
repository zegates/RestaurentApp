import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return {
      attr:{
        customer:{fname:"Sandaruwan", lname:"Nanayakkara"},
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
          createdDate: new Date()
        });
        newPost.save();
        let comet = this.get('cometd-service');
        comet.initConnection();
        comet.subscribeChannels();
        comet.createCustomer(newPost);
      }
    }
  }
});
