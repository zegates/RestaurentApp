import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({
  addedItems:[],

  didInsertElement() {
    this._super();
    var self = this;
    DM.addObserver('listItemObsv','addOrderItemList', function() {
      console.log("Order Items observer");
      Ember.set(self, 'addedItems', this.get('addOrderItemList'));
    });
    Ember.set(self, 'addedItems', DM.get('addOrderItemList'));
  },

  willDestroyElement() {
    DM.removeObserver('listItemObsv','addOrderItemList',function(){});
  }
});
