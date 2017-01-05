import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/item/list-items', 'Integration | Component | components/item/list items', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{components/item/list-items}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#components/item/list-items}}
      template block text
    {{/components/item/list-items}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
