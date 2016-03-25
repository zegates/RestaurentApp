import Ember from 'ember';
import auth from 'restaurent-app/controllers/authentication';
import cms from 'restaurent-app/namespaces/cmservice';
import Customer from 'restaurent-app/models/customer';

export default Ember.Route.extend({

  mainWidget:Ember.Object.create({
    widget: 'empty-view',
    title:''
  }),

  beforeModel: function() {
    if(auth.authStatus === cms.AuthenticationStatus.FAIL){
      this.transitionTo('public');
    }
  },

  model() {
    return {
      attr:{
        customer:auth.customer,
        mainWidget:this.mainWidget
        //customers:this.store.findAll('customer')
      }
    };
  },

  actions: {
    addCustomer(customer) {
      console.log(customer.fname+' customer router');
      if(customer.fname) {
        let cust = this.store.createRecord('customer', {
          cid: '2',
          firstName: customer.fname,
          lastName: customer.lname,
          address: customer.address,
          password: customer.password,
          createdDate: new Date()
        });
        //newPost.save();
        //let comet = this.get('cometd-service');
        ////comet.initConnection();
        //comet.subscribeChannels();
        //comet.createCustomer(newPost);

        //var cust = Customer.create({
        //    cid: '2',
        //    firstName: customer.fname,
        //    lastName: customer.lname,
        //    address: customer.address,
        //    password: customer.password,
        //    createdDate: new Date()
        //});

        let comet = this.get('cometd-service');
        comet.createRecord(cust);
      }
    },
    setWidget(path) {
      //console.log('main content set widget: '+ path);
      this.mainWidget.set('widget',path.widget);
      this.mainWidget.set('title',path.title);
    }
  }
  //,
  //getMainWidget:function(){
  //  return this.mainWidget;
  //}.property('mainWidget.widget')
});
