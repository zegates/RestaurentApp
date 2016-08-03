import DS from 'ember-data';

export default DS.Model.extend({
  fname: DS.attr('string'),
  cid: DS.attr('string'),
  lname: DS.attr('string'),
  address: DS.attr('string'),
  password: DS.attr('string'),
  createdDate: DS.attr('date')
});
