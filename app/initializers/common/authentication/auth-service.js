import Ember from 'ember';
import auth from 'restaurent-app/controllers/authentication';

var authManager  = Ember.Object.extend({

  status(){
    return auth.get('authStatus');
  },

  updateAuthenticationStatus(message){
    auth.set('authStatus', message.data.AUTH_OPERATION);
    if(message.data.customer){
      auth.set('customer', JSON.parse(message.data.customer));  
    }

    console.log('auth service '+ auth.get('authStatus'));
  }

});

export function initialize( application ) {
  //container.typeInjection('component');
  application.register('auth-service:variables', authManager, {singleton: true});
  application.inject('component', 'auth-service', 'auth-service:variables');
  application.inject('route', 'auth-service', 'auth-service:variables');

}

export default {
  name: 'common/authentication/auth-service',
  initialize: initialize
};
