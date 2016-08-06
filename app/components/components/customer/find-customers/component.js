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
    this._super();
    let self = this;
    DM.addObserver('customerList', function() {
      self.customerListObsv(this);
    });
  },


  searchCustomer:Ember.observer('searchValue', function(){
    var comet = this.get('cometd-service');
    let cust = this.get('store').createRecord('customer', {
      fname: this.searchValue,
      lname: ""
    });
    comet.findForList(cust);
  }),

  actions:{
    setCustomer(customer){
      this.sendAction('setFoundCustomer', customer);
    }
  },

  willDestroyElement() {
    DM.removeObserver('customerList',function() {
      self.customerListObsv(this);
    });
  }
});
