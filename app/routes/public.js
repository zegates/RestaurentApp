import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return {
      attr:{
        customer:{fname:"Sandaruwan", lname:"Nanayakkara"},
        //mainWidget:'module/add-order'
      }
    };
  }

  //actions: {
  //  setWidget: function (widgetName) {
  //    alert(' sss ');
  //  }
  //}


  //actions: {
  //  setWidget(widget){
  //    alert(' sss ');
  //    console.log('hello');
  //    this.set('mainWidget', widget);
  //  },
  //  addCustomer(customer) {
  //    console.log(customer.fname+' customer router');
  //
  //    let newPost = this.store.createRecord('customer', {
  //      firstName: customer.fname,
  //      lastName: customer.lname,
  //      address: customer.address,
  //      createdDate: new Date()
  //    });
  //
  //    //newPost.save();
  //    alert(this.store+ ' '+ newPost);
  //  }
  //}
});
