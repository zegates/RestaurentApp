/**
 * Created by sandaruwan on 3/4/16.
 */
import Ember from 'ember';

export default Ember.Object.create({

  AuthenticationStatus:{
    SUCCESS:'SUCCESS',
    FAIL:'FAIL'
  },

  DBStatus:{
    SUCCESS:'SUCCESS',
    FAIL:'FAIL',
    CREATED:'CREATED',
    FOUND:'FOUND'
  }
});
