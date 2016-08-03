import Ember from 'ember';
import DS from 'ember-data';
import cmservice from 'restaurent-app/namespaces/cmservice';
import Customer from 'restaurent-app/models/customer';
import dm from 'restaurent-app/controllers/dataManager';

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

    this._cometd.subscribe("/cms/customer/find/result", function(message){
      self.findCustomerCallBack(message);
    });

    this._cometd.subscribe("/cms/foodcategories/result", function(message){
      self.findFoodCategoryCallBack(message);
    });

    this._cometd.subscribe("/cms/fooditem/findforcatname/result", function(message){
      self.findFoodCategoryItemsCallBack(message);
    });
  },

  createRecordCallBack(message){
    if(message.data.DB_OPERATION === cmservice.DBStatus.FAIL){
      console.warn('Error in create '+message.data);
    }else if(message.data.DB_OPERATION === cmservice.DBStatus.CREATED){
      console.info('Created Successfully '+message.data);
    }
  },

  findCustomerCallBack(message){
    if(message.data.DB_OPERATION === cmservice.DBStatus.FAIL){
      console.warn('Error in find '+message.data);
    }else if(message.data.DB_OPERATION === cmservice.DBStatus.FOUND){
      console.info('Found Successfully '+JSON.stringify(message.data));
      var customers = [];
      JSON.parse(message.data.customers).forEach(function(cust){
        customers.pushObject(cust);
      });
      Ember.set(dm, 'customerList', customers);
    }
  },

  findFoodCategoryCallBack(message){
    if(message.data.DB_OPERATION === cmservice.DBStatus.FAIL){
      console.warn('Error in find '+message.data);
    }else if(message.data.DB_OPERATION === cmservice.DBStatus.FOUND){
      console.info('Found Successfully '+JSON.stringify(message.data));
      var foodCategories= [];
      JSON.parse(message.data.foodCategories).forEach(function(foodCategory){
        foodCategories.pushObject(foodCategory.foodCatName);
      });
      Ember.set(dm, 'foodCategoryList', foodCategories);
    }
  },

  findFoodCategoryItemsCallBack(message){
    if(message.data.DB_OPERATION === cmservice.DBStatus.FAIL){
      console.warn('Error in find '+message.data);
    }else if(message.data.DB_OPERATION === cmservice.DBStatus.FOUND){
      console.info('Found Successfully '+JSON.stringify(message.data));
      var foodCategoryItems= [];
      JSON.parse(message.data.foodCategoryItems).forEach(function(foodCategoryItem){
        foodCategoryItems.pushObject(foodCategoryItem);
      });
      Ember.set(dm, 'foodCategoryItemsList', foodCategoryItems);
    }
  },


  findFoodItemsForCategory(foodCatID){
    this._cometd.publish("/cms/fooditem/findforcatname", {
      'foodCatID':foodCatID
    });
  },

  findFoodCategory(){
    this._cometd.publish("/cms/foodcategories", {});
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
      username: entity.username,
      password: entity.password
    });
  },

  findForList(entity){
    var url = [this.baseURL, entity._internalModel.modelName].join('/') + '/find';
    this.publishRequest(url, entity.serialize());
  },

  publishRequest(url,data){
    this._cometd.publish(url,data);
  }

});

export function initialize(application) {
  application.register('cometd-service:variables', cometdService, {singleton: true});
  application.inject('component', 'cometd-service', 'cometd-service:variables');
  application.inject('route', 'cometd-service', 'cometd-service:variables');
}

export default {
  name: 'cometd-service',
  initialize: initialize
};
