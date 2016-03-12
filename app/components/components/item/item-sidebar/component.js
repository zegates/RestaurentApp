import Ember from 'ember';

export default Ember.Component.extend({

  selected:0,
  selectList:["Meals","Drinks"],

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
