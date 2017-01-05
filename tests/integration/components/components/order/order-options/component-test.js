import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/order/order-options', 'Integration | Component | components/order/order options', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{components/order/order-options}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#components/order/order-options}}
      template block text
    {{/components/order/order-options}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
