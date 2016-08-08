import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    this.print = params.print_id;
    let printPanel = this.get('config-path').componentPath[params.print_id];
    return {
      print: params.print_id,
      printWidget:printPanel
    };
  }
});
