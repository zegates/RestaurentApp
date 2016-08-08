import Ember from 'ember';

export default Ember.Mixin.create({

  getJson: function() {
    var v, json = {};
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        v = this[key];
        if (v === 'toString') {
          continue;
        }
        if (Ember.typeOf(v) === 'function') {
          continue;
        }
        if (this.detect(v))
          v = v.getJson();
        json[key] = v;
      }
    }
    return json;
  }
});
