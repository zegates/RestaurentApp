import Ember from 'ember';

export default Ember.Component.extend({
  mainWidget:'empty-view',

  actions: {
    setWidget(path) {
      //console.log('main content set widget: '+ path);
      this.set('mainWidget', path);
    },
    addCustomer(customer) {
      console.log(customer.fname+' main content customer');
      this.sendAction('addCustomer', customer);
      this.set('customer', {});

    }
  },

  getMainWidget:function(){
    return this.get('mainWidget');
  }.property('mainWidget')

});
