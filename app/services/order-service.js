import Ember from 'ember';
import DM from 'restaurent-app/controllers/dataManager';
import FoodItem from 'restaurent-app/models/FoodItem';
import FoodCategory from 'restaurent-app/models/FoodCategory';
import ItemDetail from 'restaurent-app/models/ItemDetail';
import Metric from 'restaurent-app/models/Metric';
import CustomerOrder from 'restaurent-app/models/CustomerOrder';
import OrderDetail from 'restaurent-app/models/OrderDetail';

export default Ember.Service.extend({
  addCustomerOrder(orderedCustomerOrg){

    let orderedCustomer = Ember.copy(orderedCustomerOrg, true);
    delete orderedCustomer.customerOrders;

    let comet = this.get('cometd-service');
    let orderItemList = DM.get('addOrderItemList');
    let customerOrder = CustomerOrder.create({});

    let orderDetails = [];

    let total = 0.0;
    orderItemList.forEach(function(stockDetailOrg){
      let stockDetail = Ember.copy(stockDetailOrg, true);
      let orderDetail = OrderDetail.create({
        stockDetail: stockDetail,
        qty: stockDetail.addedQty,
        sellingPrice: stockDetail.sellingPrice
      });

      total += stockDetail.addedQty * stockDetail.sellingPrice;
      delete stockDetail.foodItem;
      delete stockDetail.item;
      delete stockDetail.stockOrder;
      delete stockDetail.concatenatedProperties;
      delete stockDetail.mergedProperties;
      delete stockDetail.isDestroyed;
      delete stockDetail.isDestroying;
      delete stockDetail.addedQty;
      orderDetails.push(orderDetail);

    });

    customerOrder.total = total;
    customerOrder.customer = orderedCustomer;
    customerOrder.dateAdded = new Date();
    customerOrder.orderDetails = orderDetails;
    console.log('add customer: service');
    comet.createJsonRecord(customerOrder);
  }


});
