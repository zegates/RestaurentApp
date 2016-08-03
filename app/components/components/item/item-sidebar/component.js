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
      console.log(item);
      var itemListPrev = Ember.copy(DM.get('addOrderItemList'), true  );
      var itemListNew = [];
      var notFound = true;
      itemListPrev.forEach(function(itemExisting){
        if(itemExisting.fcid == item.fcid){
          itemExisting.remainingQty += item.remainingQty
          notFound = false;
        }
        itemListNew.push(itemExisting);
      });

      if(notFound){
        itemListNew.push(item);
      }


      DM.set('addOrderItemList', itemListNew);
      console.log(DM.get('addOrderItemList'));
    }

  }

});
