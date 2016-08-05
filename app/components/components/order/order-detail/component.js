import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({
  addedItems:[],
  total:0.0,
  changeWidget: 'changeLeftWidget',

  didInsertElement() {
    this._super();
    var self = this;
    DM.addObserver('addOrderItemList', function() {
      var itemList = this.get('addOrderItemList');
      Ember.set(self, 'total', 0.0);
      var total = 0.0;

      itemList .forEach(function(itemExisting) {
        total += itemExisting.get('addedQty') * itemExisting.get('sellingPrice');
      });
      Ember.set(self, 'total', total);
    });
  },

  actions: {
    changeLeftWidget(path){
      let orderPanelPath = this.get('config-path').componentPath[path];
      this.sendAction('changeWidget', orderPanelPath);
    }
  }

});
