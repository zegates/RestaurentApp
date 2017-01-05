import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/order/delivery-details', 'Integration | Component | components/order/delivery details', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{components/order/delivery-details}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#components/order/delivery-details}}
      template block text
    {{/components/order/delivery-details}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
