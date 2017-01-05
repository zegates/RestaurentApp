import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/customer/find-customers', 'Integration | Component | components/customer/find customers', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{components/customer/find-customers}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#components/customer/find-customers}}
      template block text
    {{/components/customer/find-customers}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
