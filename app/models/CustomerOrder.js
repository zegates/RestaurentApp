/**
 * Created by sandaruwan on 8/8/16.
 */
import Ember from 'ember';

export default Ember.Object.extend(Ember.Copyable,{
  modelName:'CustomerOrder',
  oid: '',
  address: '',
  dateAdded: '',
  discount: '',
  paid: '',
  timeAdded: '',
  total: '',
  tpNo: '',
  customer: '',
  orderDetails:[]
});

