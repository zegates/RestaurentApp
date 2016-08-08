import Ember from 'ember';
import Customer from 'restaurent-app/models/customer';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({

  store: Ember.inject.service('store'),
  searchValue: "",
  listCustomer: [],
  setFoundCustomer:'setFoundCustomer',

  customerListObsv: function(outer){
    Ember.set(this, 'listCustomer', outer.get('customerList'));
  },

  init(){
    this._super(...arguments);
    let self = this;
    DM.addObserver('customerList', function() {
      self.customerListObsv(this);
    });
  },


  //searchCustomer:Ember.observer('searchValue', function(){
  //
  //}),

  actions:{
    setCustomer(customer){
      this.sendAction('setFoundCustomer', customer);
    },

    searchInput(txtValue){
      var comet = this.get('cometd-service');
      if(txtValue.length > 0) {
        let cust = this.get('store').createRecord('customer', {
          fname: txtValue,
          lname: ""
        });
        comet.findForList(cust);
      }else{
        Ember.set(this, 'searchValue', '');
        Ember.set(this, 'listCustomer', []);
      }
      this.sendAction('setFoundCustomer', '');
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    DM.removeObserver('customerList', function() {
      self.customerListObsv(this);
    });
  }
});
