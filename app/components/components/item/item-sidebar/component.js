import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({

  selected:0,
  selectList:["Meals","Drinks"],

  didInsertElement() {
    this._super();
    var self = this;
    DM.addObserver('foodCategory', function() {
      console.log("foodCategory observer");
      Ember.set(self, 'selectList', this.get('foodCategory'));
    });
  },

  getMainItem:Ember.computed('selected', function() {
    return this.get('selectList')[this.selected];
  }),

  actions:{
    selectItem(item){
      this.set('selected',item);
      return this.selectList[item];
    }

  }




});
