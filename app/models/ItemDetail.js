/**
 * Created by sandaruwan on 8/3/16.
 */
import Ember from 'ember';

export default Ember.Object.extend(Ember.Copyable, {
  sdid:'',
  item:'',
  stockOrder:'',
  qty:'',
  cost:'',
  sellingPrice:'',
  sellingPriceForeign:'',
  isSelling:'',
  isFinite:'',
  remainingQty:''
});

