import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({
  addedItems:[],

  didInsertElement() {
    this._super();
    var self = this;
    DM.addObserver('addOrderItemList', function() {
      console.log("Order Items observer");
      Ember.set(self, 'addedItems', this.get('addOrderItemList'));
    });
  },
});
