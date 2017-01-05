import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/customer/search-customer', 'Integration | Component | components/customer/search customer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{components/customer/search-customer}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#components/customer/search-customer}}
      template block text
    {{/components/customer/search-customer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
