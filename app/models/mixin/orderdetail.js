import DS from 'ember-data';
import JsonableMixin from 'restaurent-app/models/mixin/jsonable-mixin';

export default DS.Model.extend(JsonableMixin, {
  oid: DS.attr('number'),
  address: DS.attr('string'),
  dateAdded: DS.attr('string'),
  discount: DS.attr('number'),
  paid: DS.attr('number'),
  timeAdded: DS.attr('string'),
  total: DS.attr('number'),
  tpNo: DS.attr('string'),
  customer: DS.attr('number'),
  //logSession: DS.attr('number')
});
