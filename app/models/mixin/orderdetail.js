import DS from 'ember-data';
import JsonableMixin from 'restaurent-app/models/mixin/jsonable-mixin';

export default DS.Model.extend(JsonableMixin, {
  odid: '',
  customerOrder: '',
  stockDetail: '',
  qty: '',
  sellingPrice: ''
  //logSession: DS.attr('number')
});
