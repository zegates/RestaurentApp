import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';

export default Ember.Component.extend({

  selected:0,
  selectList:[],
  categoryItemList:[],

  didInsertElement() {
    this._super();
    var self = this;
    var cometd = this.get('cometd-service');
    DM.addObserver('foodCategoryList', function() {
      console.log("foodCategory observer");
      Ember.set(self, 'selectList', this.get('foodCategoryList'));
      Ember.set(self, 'selected', 1);
      Ember.set(self, 'selected', 0);

      if(self.selectList.length > 0){
        cometd.findFoodItemsForCategory(1);
      }

    });
    DM.addObserver('foodCategoryItemsList', function() {
      console.log("foodCategory list observer");
      Ember.set(self, 'categoryItemList', this.get('foodCategoryItemsList'));
    });

    cometd.findFoodCategory();
  },

  getMainItem:Ember.computed('selected', function() {
    return this.get('selectList')[this.selected];
  }),

  actions:{
    selectItem(item){
      this.set('selected',item);
      var cometd = this.get('cometd-service');
      /* the id that comes here is -1 so should increment*/
      cometd.findFoodItemsForCategory(parseInt(item, 10)+1);
      return this.selectList[item];
    },
    addToCartItem(itemPosition){
      var item = this.get('categoryItemList')[itemPosition];
      var itemListPrev = DM.get('addOrderItemList');//Ember.copy(DM.get('addOrderItemList'), true);
      var itemListNew = [];
      var notFound = true;

      itemListPrev.forEach(function(itemExisting){
        if(itemExisting.sdid === item.sdid){
          if(item.remainingQty < itemExisting.addedQty + item.addedQty){
            Ember.set(itemExisting, 'addedQty', itemExisting.remainingQty);
          }else{
            Ember.set(itemExisting, 'addedQty', itemExisting.addedQty + item.addedQty);
          }
          notFound = false;
        }
        itemListNew.push(itemExisting);
      });

      if(notFound){
        var itemAdding = jQuery.extend(true, {}, item);
        itemListNew.push(itemAdding);
      }
      DM.set('addOrderItemList', itemListNew);
    },
    addQtyChange(itemPosition, method){
      var item = this.get('categoryItemList')[itemPosition];
      if(method ==="add"){
        if(item.addedQty + 1 <= item.remainingQty) {
          Ember.set(item, 'addedQty', item.addedQty + 1);
        }
      }else{
        if(item.addedQty - 1 > 0){
          Ember.set(item, 'addedQty', item.addedQty - 1);
        }
      }
    }

  }

});
