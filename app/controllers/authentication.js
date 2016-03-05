/**
 * Created by sandaruwan on 3/4/16.
 */
import Ember from 'ember';

let authentication = Ember.Object.extend({

  authStatus:'FAIL',

  //onAuthStatusChange:Ember.observer('authStatus', function(){
  //  console.log('s*************');
  //})

});

export default authentication.create({});
