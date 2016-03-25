import Ember from 'ember';
import DS from 'ember-data';
import cmservice from 'restaurent-app/namespaces/cmservice';
import Customer from 'restaurent-app/models/customer';

export function initialize(application) {

  var cometdService  = Ember.Object.extend({

    _cometd:$.cometd,
    _serializer:  DS.JSONAPISerializer.create({

    }),
    baseURL:'/cms',

    initConnection(){
      this._cometd.configure({
          url: 'http://localhost:8080/VozcoCMS-web/cometd',
        logLevel: 'info'
      });
      this._cometd.init();
    },

    subscribeChannels(){
      var self = this;
      this._cometd.subscribe("/cms/customer/create/status", function(message){
        console.log("received", message);
      });

      this._cometd.subscribe("/cms/customer/create", function(message){
        self.createRecordCallBack(message);
      });

    },

    createRecordCallBack(message){
      if(message.data.DB_OPERATION === cmservice.DBStatus.FAIL){
        console.warn('Error in create '+message.data);
      }else if(message.data.DB_OPERATION === cmservice.DBStatus.CREATED){
        console.info('Created Successfully '+message.data);
      }
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

    createRecord(record){
      var url = [this.baseURL, record._internalModel.modelName].join('/') + '/create';
      //TODO: Serrializer not used as it needs snapshots
      //var data = this._serializer.serialize(record);
      var data = record.serialize();
      this.publishRequest(url, data);
    },

    find(entity){
      this._cometd.publish("/cms/"+entity+"/find", {
        username: customer.username,
        password: customer.password
      });
    },

    publishRequest(url,data){
      this._cometd.publish(url,data);
    }

  });

  application.register('cometd-service:variables', cometdService, {singleton: true});
  application.inject('component', 'cometd-service', 'cometd-service:variables');
  application.inject('route', 'cometd-service', 'cometd-service:variables');

}

export default {
  name: 'cometd-service',
  initialize: initialize
};
