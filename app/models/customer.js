import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  cid: DS.attr('string'),
  lastName: DS.attr('string'),
  address: DS.attr('string'),
  password: DS.attr('string'),
  createdDate: DS.attr('date')
});
