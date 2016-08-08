import Ember from 'ember';
import PrintUtil from '../utils/print-utils';

export default Ember.Service.extend({
  //
  //init(){
  //
  //},
  themes:{
    striped:"striped",
    grid:"grid",
    plain:"plain"
  },


  addOrderBill(customer, order){

    let yPos = 0;
    let doc = PrintUtil.generateDoc();
    [doc, yPos] = PrintUtil.addTopHeader(doc, 'Hotel Villa Down', yPos);
    [doc, yPos] = PrintUtil.addText(doc, 'Order Checkout', yPos);
    [doc, yPos] = PrintUtil.addText(doc, 'Customer: ' + customer.fname, yPos);

    [doc, yPos] = PrintUtil.addTable(doc, this.getColumns(), this.getData(), yPos, this.themes.striped);
    [doc, yPos] = PrintUtil.addText(doc, 'Theme "grid"', yPos);
    [doc, yPos] = PrintUtil.addTable(doc, this.getColumns(), this.getData(), yPos, this.themes.grid);
    [doc, yPos] = PrintUtil.addText(doc, 'Theme "plain"', yPos);
    [doc, yPos] = PrintUtil.addTable(doc, this.getColumns(), this.getData(), yPos, this.themes.plain);

    return doc;
  },

  getColumns() {
    return [
      {title: "ID", dataKey: "id"},
      {title: "Name", dataKey: "first_name"},
      {title: "Email", dataKey: "email"},
      {title: "City", dataKey: "city"},
      {title: "Country", dataKey: "country"},
      {title: "Expenses", dataKey: "expenses"}
    ];
  },

// Uses the faker.js library to get random data.
  getData(rowCount) {
    rowCount = rowCount || 4;
    var sentence = "Just a sentence for the display";
    var data = [];
    for (var j = 1; j <= rowCount; j++) {
      data.push({
        id: j,
        first_name: "Sandaruwan",
        email: "sandaru.ny@gmail.com",
        country: "Sri Lanka",
        city: "Galle",
        expenses: "$200.00",
        text: sentence,
        text2: sentence
      });
    }
    return data;
  }


});
