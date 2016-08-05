import Ember from 'ember';

export function utilMultiply(params/*, hash*/) {
  var mult = 1;
  for( var i = 0; i<params.length; i++ ){
    mult = mult * params[i];
  }
  return mult;
}

export default Ember.Helper.helper(utilMultiply);
