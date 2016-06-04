import Ember from 'ember';
import Customer from 'restaurent-app/models/customer';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({

  store: Ember.inject.service('store'),
  searchValue: "Search",
  listCustomer: [],

  //didInsertElement() {
  //  this._super();
  //  var self = this;
  //
  //},

  init(){
    this._super();
    let self = this;
    DM.addObserver('customerList', function() {
      console.log("observer");
      Ember.set(self, 'listCustomer', this.get('customerList'));
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



});
