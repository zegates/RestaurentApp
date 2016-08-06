import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({
  addedItems:[],
  addOrderItemList:'addOrderItemList',

  addOrderItemListObsv:function(outer){
    console.log("Order Items observer");
    //TODO: this should be not checked,removeObserver is not working
    if(this._state !== 'destroying') {
      Ember.set(this, 'addedItems', outer.get('addOrderItemList'));
    }
  },

  didInsertElement() {
    this._super(...arguments);
    var _self = this;
    Ember.addObserver(DM, _self.addOrderItemList, function() {
      _self.addOrderItemListObsv(this);
    });

    //DM.addObserver(_self.addOrderItemList, function() {
    //  _self.addOrderItemListObsv(this);
    //});
    Ember.set(_self, 'addedItems', DM.get('addOrderItemList'));
  },

  willDestroyElement() {
    this._super(...arguments);
    var _self = this;
    //TODO: this aint working
    Ember.removeObserver(DM, _self.addOrderItemList, function(){
      _self.addOrderItemListObsv(this);
    });
    //DM.removeObserver(_self.addOrderItemList, function(){
    //  _self.addOrderItemListObsv(this);
    //});
  }
});
