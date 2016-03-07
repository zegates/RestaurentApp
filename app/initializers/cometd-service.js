import Ember from 'ember';
import cmservice from 'restaurent-app/namespaces/cmservice';

export function initialize(application) {

  var cometdService  = Ember.Object.extend({

    _cometd:$.cometd,

    initConnection(){
      this._cometd.configure({
        url: 'http://localhost:8080/VozcoCMS-web/cometd',
        logLevel: 'info'
      });
      this._cometd.init();
    },

    subscribeChannels(){
      this._cometd.subscribe("/cms/customer/create/status", function(message){
        console.log("received", message);
      });

    },

    subscribeAuthChannels(authStatusCallBack){
      this._cometd.subscribe("/cms/authenticate/status", function(message){
        console.log("received auth", message);
        authStatusCallBack(message);
       });
    },

    authenticate(customer){
      this._cometd.publish("/cms/authenticate", {
        username: customer.username,
        password: customer.password
      });
    },

    createCustomer(customer){
      this._cometd.publish("/cms/customer/create", {
        cid: 'jema',
        text: 'hello'
      });
    }

  });


  //container.typeInjection('component');
  application.register('cometd-service:variables', cometdService, {singleton: true});
  application.inject('component', 'cometd-service', 'cometd-service:variables');
  application.inject('route', 'cometd-service', 'cometd-service:variables');

}

export default {
  name: 'cometd-service',
  initialize: initialize
};
