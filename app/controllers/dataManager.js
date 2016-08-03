/**
 * Created by sandaruwan on 3/4/16.
 */
import Ember from 'ember';

let dataManager = Ember.Object.extend({
  customerList:[],
  foodCategoryList:[],
  foodCategoryItemsList:[],
  addOrderItemList:[]
});

export default dataManager.create({});
