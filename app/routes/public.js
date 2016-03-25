import Ember from 'ember';
import auth from 'restaurent-app/controllers/authentication';
import cms from 'restaurent-app/namespaces/cmservice';

export default Ember.Route.extend({

  init(){
    this._super();
    let self = this;
    auth.addObserver('authStatus', function(){
      self.authStatus(this.get('authStatus'));
    });
  },

  authStatus(authStatus){
    if(authStatus === cms.AuthenticationStatus.FAIL){
      this.transitionTo('public');
    }else if(authStatus === cms.AuthenticationStatus.SUCCESS){
      this.transitionTo('secure');
      let comet = this.get('cometd-service');
      comet.subscribeChannels();
    }
  },


  model() {
    return {
      attr:{
        customer:{fname:'', lname:'', username:'', password:''},
      }
    };
  },

  actions: {
    login(customer) {
      console.log(customer.username+' customer login router');

      let comet = this.get('cometd-service');
      let auth_service = this.get('auth-service');
      comet.initConnection();
      comet.subscribeAuthChannels(auth_service.updateAuthenticationStatus);
      comet.authenticate(customer);
    }
  }
});
