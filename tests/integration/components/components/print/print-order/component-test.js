import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/print/print-order', 'Integration | Component | components/print/print order', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{components/print/print-order}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#components/print/print-order}}
      template block text
    {{/components/print/print-order}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
