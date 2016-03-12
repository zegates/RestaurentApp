/*!
* ember-table v0.9.2
* Copyright 2012-2016 Addepar Inc.
* See LICENSE.md
*/
(function(){;
var define, requireModule, require, requirejs;

(function() {

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {}, seen = {};
  var FAILED = false;

  var uuid = 0;

  function tryFinally(tryable, finalizer) {
    try {
      return tryable();
    } finally {
      finalizer();
    }
  }

  function unsupportedModule(length) {
    throw new Error("an unsupported module was defined, expected `define(name, deps, module)` instead got: `" + length + "` arguments to define`");
  }

  var defaultDeps = ['require', 'exports', 'module'];

  function Module(name, deps, callback, exports) {
    this.id       = uuid++;
    this.name     = name;
    this.deps     = !deps.length && callback.length ? defaultDeps : deps;
    this.exports  = exports || { };
    this.callback = callback;
    this.state    = undefined;
    this._require  = undefined;
  }


  Module.prototype.makeRequire = function() {
    var name = this.name;

    return this._require || (this._require = function(dep) {
      return require(resolve(dep, name));
    });
  }

  define = function(name, deps, callback) {
    if (arguments.length < 2) {
      unsupportedModule(arguments.length);
    }

    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }

    registry[name] = new Module(name, deps, callback);
  };

  // we don't support all of AMD
  // define.amd = {};
  // we will support petals...
  define.petal = { };

  function Alias(path) {
    this.name = path;
  }

  define.alias = function(path) {
    return new Alias(path);
  };

  function reify(mod, name, seen) {
    var deps = mod.deps;
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    // TODO: new Module
    // TODO: seen refactor
    var module = { };

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        module.exports = reified[i] = seen;
      } else if (dep === 'require') {
        reified[i] = mod.makeRequire();
      } else if (dep === 'module') {
        mod.exports = seen;
        module = reified[i] = mod;
      } else {
        reified[i] = requireFrom(resolve(dep, name), name);
      }
    }

    return {
      deps: reified,
      module: module
    };
  }

  function requireFrom(name, origin) {
    var mod = registry[name];
    if (!mod) {
      throw new Error('Could not find module `' + name + '` imported from `' + origin + '`');
    }
    return require(name);
  }

  function missingModule(name) {
    throw new Error('Could not find module ' + name);
  }
  requirejs = require = requireModule = function(name) {
    var mod = registry[name];


    if (mod && mod.callback instanceof Alias) {
      mod = registry[mod.callback.name];
    }

    if (!mod) { missingModule(name); }

    if (mod.state !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    tryFinally(function() {
      reified = reify(mod, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    }, function() {
      if (!loaded) {
        mod.state = FAILED;
      }
    });

    var obj;
    if (module === undefined && reified.module.exports) {
      obj = reified.module.exports;
    } else {
      obj = seen[name] = module;
    }

    if (obj !== null &&
        (typeof obj === 'object' || typeof obj === 'function') &&
          obj['default'] === undefined) {
      obj['default'] = obj;
    }

    return (seen[name] = obj);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase = nameParts.slice(0, -1);

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') {
        if (parentBase.length === 0) {
          throw new Error('Cannot access parent module of root');
        }
        parentBase.pop();
      } else if (part === '.') { continue; }
      else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.clear = function(){
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

;define("ember-table/components/body-table-container", 
  ["ember","ember-table/mixins/table-container","ember-table/mixins/show-horizontal-scroll","ember-table/mixins/touch-move-handler","ember-table/mixins/scroll-handler","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TableContainer = __dependency2__["default"];
    var ShowHorizontalScrollMixin = __dependency3__["default"];
    var TouchMoveHandlerMixin = __dependency4__["default"];
    var ScrollHandlerMixin = __dependency5__["default"];

    __exports__["default"] = Ember.Component.extend( TableContainer,
    TouchMoveHandlerMixin, ScrollHandlerMixin,
    ShowHorizontalScrollMixin, {

      classNames: ['ember-table-table-container',
          'ember-table-body-container',
          'antiscroll-wrap'],

      bodyHeight: null,
      bodyWidth: null,
      scrollLeft: null,
      height: Ember.computed.alias('bodyHeight'),
      width: Ember.computed.alias('bodyWidth'),
      // TODO (Artych) where it should be
      scrollElementSelector: '.antiscroll-inner',

      _scrollTop: 0,

      actions: {
        rowDidClick: function(row, event) {
          this.sendAction('rowDidClick', row, event);
        },

        scrollChange: function(scrollLeft, scrollTop) {
          this.set('_scrollTop', scrollTop);
          this.set('scrollLeft', scrollLeft);
        },

        scrollTopChange: function(scrollLeft, scrollTop) {
          this.set('_scrollTop', scrollTop);
        },

        toggleRowCollapse: function(row) {
          this.sendAction('toggleRowCollapse', row);
        }
      }
    });
  });
;define("ember-table/mixins/table-container", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    __exports__["default"] = Ember.Mixin.create(
    StyleBindingsMixin, {
      classNames: ['ember-table-table-container'],
      styleBindings: ['height', 'width']
    });
  });
;define("ember-table/mixins/style-bindings", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // TODO(azirbel): This needs to be an external dependency.
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      concatenatedProperties: ['styleBindings'],
      attributeBindings: ['style'],
      unitType: 'px',
      createStyleString: function(styleName, property) {
        var value;
        value = this.get(property);
        if (Ember.isNone(value)) {
          return;
        }
        if (Ember.typeOf(value) === 'number') {
          value = value + this.get('unitType');
        }
        return Ember.String.dasherize("" + styleName) + ":" + value + ";";
      },
      applyStyleBindings: Ember.on('init',
        Ember.observer('styleBindings', function() {
        var lookup, properties, styleBindings, styleComputed, styles,
          _this = this;
        styleBindings = this.get('styleBindings');
        if (!styleBindings) {
          return;
        }
        lookup = {};
        styleBindings.forEach(function(binding) {
          var property, style, tmp;
          tmp = binding.split(':');
          property = tmp[0];
          style = tmp[1];
          lookup[style || property] = property;
        });
        styles = Object.keys(lookup);
        properties = styles.map(function(style) {
          return lookup[style];
        });
        styleComputed = Ember.computed(function() {
          var styleString, styleTokens;
          styleTokens = styles.map(function(style) {
            return _this.createStyleString(style, lookup[style]);
          });
          styleString = styleTokens.join('');
          if (styleString.length !== 0) {
            return new Ember.Handlebars.SafeString(styleString);
          }
        });
        styleComputed.property.apply(styleComputed, properties);
        return Ember.defineProperty(this, 'style', styleComputed);
      }))
    });
  });
;define("ember-table/mixins/show-horizontal-scroll", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // HACK: We want the horizontal scroll to show on mouse enter and leave.
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      mouseEnter: function(event) {
        var $tablesContainer =
            Ember.$(event.target).parents('.ember-table-tables-container');
        var $horizontalScroll =
            $tablesContainer.find('.antiscroll-scrollbar-horizontal');
        $horizontalScroll.addClass('antiscroll-scrollbar-shown');
      },

      mouseLeave: function(event) {
        var $tablesContainer =
            Ember.$(event.target).parents('.ember-table-tables-container');
        var $horizontalScroll =
            $tablesContainer.find('.antiscroll-scrollbar-horizontal');
        $horizontalScroll.removeClass('antiscroll-scrollbar-shown');
      }
    });
  });
;define("ember-table/mixins/touch-move-handler", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      onTouchMove: Ember.K,

      didRender: function() {
        var _this = this;
        var startX = 0;
        var startY = 0;

        this._super();

        this.$().bind('touchstart', function(event) {
          startX = event.originalEvent.targetTouches[0].pageX;
          startY = event.originalEvent.targetTouches[0].pageY;
        });

        this.$().bind('touchmove', function(event) {
          var newX = event.originalEvent.targetTouches[0].pageX;
          var newY = event.originalEvent.targetTouches[0].pageY;
          var deltaX = -(newX - startX);
          var deltaY = -(newY - startY);
          Ember.run(_this, _this.onTouchMove, event, deltaX, deltaY);
          startX = newX;
          startY = newY;
        });
      },

      willDestroyElement: function() {
        this.$().unbind('touchstart');
        this.$().unbind('touchmove');
        this._super();
      }
    });
  });
;define("ember-table/mixins/scroll-handler", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      onScroll: Ember.K,
      scrollElementSelector: '',

      didRender: function() {
        var _this = this;
        this._super();
        this.$(this.get('scrollElementSelector')).bind('scroll', function(event) {
          Ember.run(_this, _this.onScroll, event);
        });
      },

      willDestroyElement: function() {
        var $scrollElementSelector = this.$(this.get('scrollElementSelector'));
        if ($scrollElementSelector) {
          $scrollElementSelector.unbind('scroll');
        }
        this._super();
      }
    });
  });
;define("ember-table/components/column-sortable-indicator", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend(
    StyleBindingsMixin, {
      classNames: 'ember-table-column-sortable-indicator',
      classNameBindings: 'isShowingSortableIndicator:active',
      styleBindings: ['left', 'height'],
      left: Ember.computed.alias('sortableIndicatorLeft'),
      height: Ember.computed.alias('tableHeight'),

      sortableIndicatorLeft: null,
      tableHeight: null,
      isShowingSortableIndicator: null
    });
  });
;define("ember-table/components/ember-table", 
  ["ember","ember-table/mixins/style-bindings","ember-table/mixins/resize-handler","ember-table/models/row","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];
    var ResizeHandlerMixin = __dependency3__["default"];
    var Row = __dependency4__["default"];

    __exports__["default"] = Ember.Component.extend(
    StyleBindingsMixin, ResizeHandlerMixin, {
      classNames: ['ember-table-tables-container'],
      classNameBindings: ['enableContentSelection:ember-table-content-selectable'],

      // ---------------------------------------------------------------------------
      // API - Inputs
      // ---------------------------------------------------------------------------

      // Values which are bound to the table's style attr. See
      // `Ember.StyleBindingsMixin` documentation for more details.
      styleBindings: ['height'],

      // An array of row objects. Usually a hash where the keys are column names
      // and the values are the rows's values. However, could be any object, since
      // each column can define a function to return the column value given the row
      // object. See `Ember.Table.ColumnDefinition.getCellContent`.
      content: [],

      // An array of column definitions: see `Ember.Table.ColumnDefinition`. Allows
      // each column to have its own configuration.
      // TODO(new-api): Rename to `data`
      columns: null,

      // The number of fixed columns on the left side of the table. Fixed columns
      // are always visible, even when the table is scrolled horizontally.
      numFixedColumns: 0,

      // The number of footer rows in the table. Footer rows appear at the bottom of
      // the table and are always visible.
      // TODO(new-api): Rename to `numFooterRows`
      numFooterRow: 0,

      // The row height in pixels. A consistent row height is necessary to calculate
      // which rows are being shown, to enable lazy rendering.
      // TODO: Currently must be kept in sync with the LESS file.
      rowHeight: 30,

      // The minimum header height in pixels. Headers will grow in height if given
      // more content than they can display.
      // TODO: Currently must be kept in sync with the LESS file.
      minHeaderHeight: 30,

      // The footer height in pixels.
      // TODO: Currently must be kept in sync with the LESS file.
      footerHeight: 30,

      // Enables or disables the header block.
      hasHeader: true,

      // Enables or disables the footer block.
      // TODO(new-api): Control this via `numFooterRows` and remove from API
      hasFooter: true,

      enableColumnReorder: true,

      // Allow users to select the content of table cells.
      enableContentSelection: false,

      // Sets which column resizing behavior to use. Possible values are
      // <code>'standard'</code> (resizing a column pushes or pulls all other
      // columns) and <code>'fluid'</code> (resizing a column steals width from
      // neighboring columns).
      columnMode: 'standard',

      // Sets which row selection behavior to follow. Possible values are 'none'
      // (clicking on a row does nothing), 'single' (clicking on a row selects it
      // and deselects other rows), and 'multiple' (multiple rows can be selected
      // through ctrl/cmd-click or shift-click).
      selectionMode: 'single',

      // ---------------------------------------------------------------------------
      // API - Outputs
      // ---------------------------------------------------------------------------

      // An array of the rows currently selected. If `selectionMode` is set to
      // 'single', the array will contain either one or zero elements.
      selection: Ember.computed('persistedSelection.[]', 'rangeSelection.[]', 'selectionMode', {
        set: function(key, val) {
          if (val) {
            var selectionMode = this.get('selectionMode');
            this.get('persistedSelection').clear();
            this.get('rangeSelection').clear();
            switch (selectionMode) {
              case 'none':
                val = null;
                break;
              case 'single':
                this.get('persistedSelection').addObject(val);
                break;
              case 'multiple':
                this.get('persistedSelection').addObjects(val);
            }
          }
          return val;
        },
        get: function() {
          var selectionMode = this.get('selectionMode');
          var selection = this.get('persistedSelection').copy().addObjects(this.get('rangeSelection'));
          switch (selectionMode) {
            case 'none':
              return null;
            case 'single':
              return selection[0] || null;
            case 'multiple':
              return selection;
          }
        }
      }),

      // ---------------------------------------------------------------------------
      // Internal properties
      // ---------------------------------------------------------------------------

      // Special flag used by child views to look up this component using
      // nearestWithProperty()
      isEmberTable: true,

      columnsFillTable: true,

      // _resolvedContent is an intermediate property between content and rows
      // This allows content to be a plain array or a promise resolving to an array
      _resolvedContent: Ember.computed('content', {
        set: function(key, value) {
          return value;
        },
        get: function() {
          var _this = this;
          var value = [];

          var content = this.get('content');
          if (content.then) {
            // content is a promise
            content.then(function(resolvedContent) {
              // when the promise resolves, set this property so it gets cached
              _this.set('_resolvedContent', resolvedContent);

              // if the promise resolves immediately, set `value` so we return
              // the resolved value and not []
              value = resolvedContent;
            });

            // returns [] if the promise doesn't resolve immediately, or
            // the resolved value if it's ready
            return value;
          } else {
            // content is not a promise
            return content;
          }
        }
      }),

      init: function() {
        this._super();
        if (!Ember.$.ui) {
          throw 'Missing dependency: jquery-ui';
        }
        if (!Ember.$().mousewheel) {
          throw 'Missing dependency: jquery-mousewheel';
        }
        if (!Ember.$().antiscroll) {
          throw 'Missing dependency: antiscroll.js';
        }
        this.prepareTableColumns();
      },

      height: Ember.computed.alias('_tablesContainerHeight'),

      // TODO(new-api): eliminate view alias
      // specify the view class to use for rendering the table rows
      tableRowView: 'table-row',
      tableRowViewClass: Ember.computed.alias('tableRowView'),

      // An array of Ember.Table.Row computed based on `content`
      // bodyContent: Ember.computed(function() {
      //   return RowArrayController.create({
      //     target: this,
      //     parentController: this,
      //     container: this.get('container'),
      //     itemController: Row,
      //     content: this.get('_resolvedContent')
      //   });
      // }).property('_resolvedContent.[]'),
      rowClass: Row,

      bodyContent: Ember.computed('_resolvedContent.[]', function() {
        var rowClass = this.get('rowClass');
        var self = this;
        return (this.get('_resolvedContent') || []).map(function(datum, index) {
          return rowClass.create({
            content: datum,
            itemIndex: index,
            tableComponent: self
          });
        });
      }),

      // An array of Ember.Table.Row
      footerContent: Ember.computed({
        set: function(key, value) {
          return value;
        },
        get: function() {
          return Ember.A();
        }
      }),


      fixedColumns: Ember.computed(function() {
        var columns = this.get('columns');
        if (!columns) {
          return Ember.A();
        }
        var numFixedColumns = this.get('numFixedColumns') || 0;
        return columns.slice(0, numFixedColumns) || [];
      }).property('columns.[]', 'numFixedColumns'),

      tableColumns: Ember.computed(function() {
        var columns = this.get('columns');
        if (!columns) {
          return Ember.A();
        }
        var numFixedColumns = this.get('numFixedColumns') || 0;
        return columns.slice(numFixedColumns, columns.get('length')) || [];
      }).property('columns.[]', 'numFixedColumns'),

      prepareTableColumns: function() {
        var _this = this;
        var columns = this.get('columns') || Ember.A();
        columns.setEach('controller', this);
        columns.forEach(function(col, i) {
          col.set('nextResizableColumn', _this.getNextResizableColumn(columns, i));
        });
      },

      getNextResizableColumn: function(columns, index) {
        var column;
        while (index < columns.length) {
          index += 1;
          column = columns.objectAt(index);
          if (column != null && column.get('isResizable')) {
            return column;
          }
        }
        return null;
      },

      // ---------------------------------------------------------------------------
      // View concerns
      // ---------------------------------------------------------------------------
      didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderCalculations');
      },

      didRenderCalculations: function() {
        this.elementSizeDidChange();
        this.doForceFillColumns();
      },

      willDestroyElement: function() {
        var antiscrollElements = this.$('.antiscroll-wrap');
        var antiscroll;
        antiscrollElements.each(function(i, antiscrollElement) {
          antiscroll = Ember.$(antiscrollElement).data('antiscroll');
          if (antiscroll) {
            antiscroll.destroy();
            Ember.$(antiscrollElement).removeData('antiscroll');
          }
        });
        this._super();
      },

      onResizeEnd: function() {
        // We need to put this on the run loop, because resize event came from
        // window. Otherwise, we get this warning when used in tests. You have
        // turned on testing mode, which disabled the run-loop's autorun. You
        // will need to wrap any code with asynchronous side-effects in an
        // Ember.run
        if (this.tableWidthNowTooSmall()) {
          this.set('columnsFillTable', true);
        }
        Ember.run(this, this.elementSizeDidChange);
      },

      elementSizeDidChange: function() {
        if ((this.get('_state') || this.get('state')) !== 'inDOM') {
          return;
        }
        this.set('_width', this.$().parent().width());
        this.set('_height', this.$().parent().height());
        // we need to wait for the table to be fully rendered before antiscroll can
        // be used
        Ember.run.next(this, this.updateLayout);
      },

      tableWidthNowTooSmall: function() {
        if ((this.get('_state') || this.get('state')) !== 'inDOM') {
          return false;
        }
        var oldTableWidth = this.get('_width');
        var newTableWidth = this.$().parent().width();
        // TODO(azirbel): This should be 'columns', I believe. Fix separately.
        var totalColumnWidth = this._getTotalWidth(this.get('tableColumns'));
        return (oldTableWidth > totalColumnWidth) && (newTableWidth < totalColumnWidth);
      },

      updateLayout: function() {
        if ((this.get('_state') || this.get('state')) !== 'inDOM') {
          return;
        }
        // updating antiscroll
        this.$('.antiscroll-wrap').antiscroll().data('antiscroll').rebuild();
        if (this.get('columnsFillTable')) {
          this.doForceFillColumns();
        }
      },

      /**
       * Resizes a column, and returns whether or not the column is now at it's
       * minimum or maximum.
       *
       * @private
       * @param {ColumnDefinition} column The column to be resized
       * @param {number} totalResizableWidth The total width of the table that
       *   can be resized
       * @param {number} availableWidth The total width available in the table
       * @returns {boolean}
       */
      _resizeColumn: function(column, totalResizableWidth, availableWidth) {
        var newWidth = Math.floor(column.get('width') * (availableWidth / totalResizableWidth));

        var minWidth = column.get('minWidth');
        var maxWidth = column.get('maxWidth');

        if (newWidth < minWidth) {
          column.set('width', minWidth);
          return true;
        } else if (newWidth > maxWidth) {
          column.set('width', maxWidth);
          return true;
        } else {
          column.set('width', newWidth);
          return false;
        }
      },

      // Iteratively adjusts column widths to adjust to a changed table width.
      // Attempts to scale columns proportionally. However, if a column hits a min
      // or max width after scaling proportionally, we need to respect that setting.
      // In that case, keep iterating until all column widths are set to the best
      // they can be. Note that this may fail to arrive at the table width if the
      // resizable columns are all restricted by min/max widths.
      doForceFillColumns: function() {
        var allColumns = this.get('columns');
        var columnsToResize = allColumns.filterBy('canAutoResize');
        var unresizableColumns = allColumns.filterBy('canAutoResize', false);
        var availableWidth = this.get('_width') - this._getTotalWidth(unresizableColumns);

        var continueResizingColumns = true;
        while (continueResizingColumns) {
          var totalResizableWidth = this._getTotalWidth(columnsToResize);
          var nextColumnsToResize = [];
          continueResizingColumns = false;

          for (var i = 0; i < columnsToResize.get('length'); ++i) {
            var column = columnsToResize[i];
            var isColumnAtExtremum = this._resizeColumn(column, totalResizableWidth,
              availableWidth);

            if (isColumnAtExtremum) {
              continueResizingColumns = true;
              availableWidth -= column.get('width');
            } else {
              nextColumnsToResize.pushObject(column);
            }
          }

          columnsToResize = nextColumnsToResize;
        }
      },

      onBodyContentLengthDidChange: Ember.observer('bodyContent.length', function() {
        Ember.run.next(this, function() {
          Ember.run.once(this, this.updateLayout);
        });
      }),

      // ---------------------------------------------------------------------------
      // Private variables
      // ---------------------------------------------------------------------------

      // _tableScrollTop: 0,
      _tableScrollLeft: 0,

      _width: null,
      _height: null,
      _contentHeaderHeight: null,

      _sortableIndicatorLeft: 0,

      _hasVerticalScrollbar: Ember.computed(function() {
        var height = this.get('_height');
        var contentHeight = this.get('_tableContentHeight') +
            this.get('_headerHeight') + this.get('_footerHeight');
        return height < contentHeight;
      }).property('_height', '_tableContentHeight', '_headerHeight',
          '_footerHeight'),

      _hasHorizontalScrollbar: Ember.computed(function() {
        var contentWidth = this.get('_tableColumnsWidth');
        var tableWidth = this.get('_width') - this.get('_fixedColumnsWidth');
        return contentWidth > tableWidth;
      }).property('_tableColumnsWidth', '_width', '_fixedColumnsWidth'),

      // tables-container height adjusts to the content height
      _tablesContainerHeight: Ember.computed(function() {
        var height = this.get('_height');
        var contentHeight = this.get('_tableContentHeight') +
            this.get('_headerHeight') + this.get('_footerHeight');
        return Math.min(contentHeight, height);
      }).property('_height', '_tableContentHeight', '_headerHeight',
          '_footerHeight'),

      // Actual width of the fixed columns
      _fixedColumnsWidth: Ember.computed(function() {
        return this._getTotalWidth(this.get('fixedColumns'));
      }).property('fixedColumns.@each.width'),

      // Actual width of the (non-fixed) columns
      _tableColumnsWidth: Ember.computed(function() {
        // Hack: We add 3px padding to the right of the table content so that we can
        // reorder into the last column.
        var contentWidth = this._getTotalWidth(this.get('tableColumns')) + 3;
        var availableWidth = this.get('_width') - this.get('_fixedColumnsWidth');
        return Math.max(contentWidth, availableWidth);
      }).property('tableColumns.@each.width', '_width', '_fixedColumnsWidth'),

      _rowWidth: Ember.computed(function() {
        var columnsWidth = this.get('_tableColumnsWidth');
        var nonFixedTableWidth = this.get('_tableContainerWidth') -
            this.get('_fixedColumnsWidth');
        return Math.max(columnsWidth, nonFixedTableWidth);
      }).property('_fixedColumnsWidth', '_tableColumnsWidth',
          '_tableContainerWidth'),

      // Dynamic header height that adjusts according to the header content height
      _headerHeight: Ember.computed(function() {
        var minHeight = this.get('minHeaderHeight');
        var contentHeaderHeight = this.get('_contentHeaderHeight');
        return Math.max(contentHeaderHeight, minHeight);
      }).property('_contentHeaderHeight', 'minHeaderHeight'),

      // Dynamic footer height that adjusts according to the footer content height
      _footerHeight: Ember.computed(function() {
        return this.get('hasFooter') ? this.get('footerHeight') : 0;
      }).property('footerHeight', 'hasFooter'),

      _bodyHeight: Ember.computed(function() {
        var bodyHeight = this.get('_tablesContainerHeight');
        if (this.get('hasHeader')) {
          bodyHeight -= this.get('_headerHeight');
        }
        if (this.get('hasFooter')) {
          bodyHeight -= this.get('footerHeight');
        }
        return bodyHeight;
      }).property('_tablesContainerHeight', '_hasHorizontalScrollbar',
          '_headerHeight', 'footerHeight', 'hasHeader', 'hasFooter'),

      _tableBlockWidth: Ember.computed(function() {
        return this.get('_width') - this.get('_fixedColumnsWidth');
      }).property('_width', '_fixedColumnsWidth'),

      _fixedBlockWidthBinding: '_fixedColumnsWidth',

      _tableContentHeight: Ember.computed(function() {
        return this.get('rowHeight') * this.get('bodyContent.length');
      }).property('rowHeight', 'bodyContent.length'),

      _tableContainerWidth: Ember.computed(function() {
        return this.get('_width');
      }).property('_width'),

      _scrollContainerWidth: Ember.computed(function() {
        return this.get('_width') - this.get('_fixedColumnsWidth');
      }).property('_width', '_fixedColumnsWidth'),

      _getTotalWidth: function(columns, columnWidthPath) {
        if (columnWidthPath == null) {
          columnWidthPath = 'width';
        }
        if (!columns) {
          return 0;
        }
        var widths = columns.getEach(columnWidthPath) || [];
        return widths.reduce((function(total, w) {
          return total + w;
        }), 0);
      },

      // ---------------------------------------------------------------------------
      // Selection
      // TODO: Make private or reorganize into a new section
      // ---------------------------------------------------------------------------

      lastSelected: null,

      isSelected: function(row) {
        switch (this.get('selectionMode')) {
          case 'none':
            return false;
          case 'single':
            return this.get('selection') === row.get('content');
          case 'multiple':
            return this.get('selection').contains(row.get('content'));
        }
      },

      setSelected: function(row, val) {
        this.persistSelection();
        var item = row.get('content');
        if (val) {
          return this.get('persistedSelection').addObject(item);
        } else {
          return this.get('persistedSelection').removeObject(item);
        }
      },

      // items that were selected directly or as part of a previous
      // range selection (shift-click)
      persistedSelection: Ember.computed(function() {
        return Ember.A();
      }),

      // items that are part of the currently editable range selection
      rangeSelection: Ember.computed(function() {
        return Ember.A();
      }),

      findRow: function(content) {
        // TODO(azirbel): Replace with filter
        this.get('bodyContent').forEach(function(row) {
          if (row.get('content') === content) {
            return row;
          }
        });
        return null;
      },

      rowIndex: function(row) {
        if (!this.get('bodyContent')) {
          return null;
        }
        return this.get('bodyContent').indexOf(row);
      },

      persistSelection: function() {
        this.get('persistedSelection').addObjects(this.get('rangeSelection'));
        this.get('rangeSelection').clear();
      },

      // TODO(azirbel): Document
      actions: {
        addColumn: Ember.K,

        sortByColumn: function(column) {
          this.sendAction('sortByColumn', column);
        },

        rowDidClick: function(row, event) {
          var item = row.get('content');
          switch (this.get('selectionMode')) {
            case 'none':
              break;
            case 'single':
              this.get('persistedSelection').clear();
              this.get('persistedSelection').addObject(item);
              break;
            case 'multiple':
              if (event.shiftKey) {
                this.get('rangeSelection').clear();

                var lastIndex = this.rowIndex(this.get('lastSelected'));
                // If the last selected row is no longer in the table, use the
                // first row in the table
                if (lastIndex === -1) {
                  lastIndex = 0;
                }

                var curIndex = this.rowIndex( row );
                var minIndex = Math.min(lastIndex, curIndex);
                var maxIndex = Math.max(lastIndex, curIndex);

                this.get('rangeSelection').addObjects(
                  this.get('bodyContent').slice(minIndex, maxIndex + 1)
                  .mapBy('content')
                );
              } else {
                if (!event.ctrlKey && !event.metaKey) {
                  this.get('persistedSelection').clear();
                  this.get('rangeSelection').clear();
                } else {
                  this.persistSelection();
                }
                if (this.get('persistedSelection').contains(item)) {
                  this.get('persistedSelection').removeObject(item);
                } else {
                  this.get('persistedSelection').addObject(item);
                }
                this.set('lastSelected', row);
              }
              break;
          }
        },

        scrollLeftDidChange: function(scrollLeft) {
          this.set('_tableScrollLeft', scrollLeft);
        },

        columnDidSort: function(fromIndex, toIndex) {
          // Fixed columns are not affected by column reordering
          var numFixedColumns = this.get('fixedColumns.length');
          var columns = this.get('columns');
          var column = columns[ numFixedColumns + fromIndex ];
          columns.removeObject(column);
          columns.insertAt( numFixedColumns + toIndex, column);
          this.prepareTableColumns();
          this.set('_isShowingSortableIndicator', false);
          this.sendAction('onColumnReordered', columns, column, toIndex);
        },

        toggleRowCollapse: Ember.K,
        toggleTableCollapse: Ember.K,
      }
    });
  });
;define("ember-table/mixins/resize-handler", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // TODO(azirbel): This needs to be an external dependency.
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      resizeEndDelay: 200,
      resizing: false,
      onResizeStart: Ember.K,
      onResizeEnd: Ember.K,
      onResize: Ember.K,

      endResize: Ember.computed(function() {
        return function(event) {
          if (this.isDestroyed) {
            return;
          }
          this.set('resizing', false);
          return typeof this.onResizeEnd === "function" ? this.onResizeEnd(event) : void 0;
        };
      }),

      handleWindowResize: function(event) {
        if ((typeof event.target.id !== "undefined" && event.target.id !== null) &&
            (event.target.id !== this.elementId)) {
          return;
        }
        if (!this.get('resizing')) {
          this.set('resizing', true);
          if (typeof this.onResizeStart === "function") {
            this.onResizeStart(event);
          }
        }
        if (typeof this.onResize === "function") {
          this.onResize(event);
        }
        return Ember.run.debounce(this, this.get('endResize'), event, this.get('resizeEndDelay'));
      },

      didRender: function() {
        this._super();
        return this._setupDocumentHandlers();
      },

      willDestroyElement: function() {
        this._removeDocumentHandlers();
        return this._super();
      },

      _setupDocumentHandlers: function() {
        if (this._resizeHandler) {
          return;
        }
        this._resizeHandler = Ember.$.proxy(this.get('handleWindowResize'), this);
        return Ember.$(window).on("resize." + this.elementId, this._resizeHandler);
      },

      _removeDocumentHandlers: function() {
        Ember.$(window).off("resize." + this.elementId, this._resizeHandler);
        return this._resizeHandler = null;
      }
    });
  });
;define("ember-table/models/row", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.ObjectProxy.extend({
      content: null,
      tableComponent: null,

      isShowing: true,
      isHovered: false,

      isSelected: Ember.computed('tableComponent.selection.[]', {
        set: function(key, val) {
          this.get('tableComponent').setSelected(this, val);
          return this.get('tableComponent').isSelected(this);
        },
        get: function() {
        	return this.get('tableComponent').isSelected(this);
        }
      })
    });
  });
;define("ember-table/components/footer-block", 
  ["ember","ember-table/mixins/table-block","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TableBlock = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend( TableBlock );
  });
;define("ember-table/mixins/table-block", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    __exports__["default"] = Ember.Mixin.create(
    StyleBindingsMixin, {
      classNames: ['ember-table-table-block'],
      styleBindings: ['width', 'height'],
      itemViewClass: null,
      columns: null,
      content: null,
      scrollLeft: null,
      rowWidth: null,
      rowHeight: null,

      width: Ember.computed.alias('blockWidth'),
      height: Ember.computed.alias('rowHeight'),

      onScrollLeftDidChange: Ember.observer('scrollLeft', function() {
        this.$().scrollLeft(this.get('scrollLeft'));
      }),


    });
  });
;define("ember-table/components/footer-table-container", 
  ["ember","ember-table/mixins/table-container","ember-table/mixins/show-horizontal-scroll","ember-table/mixins/mouse-wheel-handler","ember-table/mixins/touch-move-handler","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TableContainer = __dependency2__["default"];
    var ShowHorizontalScrollMixin = __dependency3__["default"];
    var MouseWheelHandlerMixin = __dependency4__["default"];
    var TouchMoveHandlerMixin = __dependency5__["default"];

    __exports__["default"] = Ember.Component.extend( TableContainer,
    MouseWheelHandlerMixin, TouchMoveHandlerMixin, ShowHorizontalScrollMixin, {

      classNames: ['ember-table-table-container',
        'ember-table-fixed-table-container',
        'ember-table-footer-container'],
      styleBindings: 'top',
      height: Ember.computed.alias('footerHeight'),
      width: Ember.computed.alias('tableContainerWidth'),
      scrollLeft: null,
      footerHeight: null,
      tableContainerWidth:null,
      headerHeight: null,
      tableContentHeight: null,
      bodyHeight: null,

      top: Ember.computed(function() {
        var headerHeight = this.get('headerHeight');
        var contentHeight = this.get('tableContentHeight') +
            headerHeight;
        var bodyHeight = this.get('bodyHeight') + headerHeight;
        if (contentHeight < bodyHeight) {
          return contentHeight;
        } else {
          return bodyHeight;
        }
      }).property('bodyHeight', 'headerHeight', 'tableContentHeight'),

      onMouseWheel: function(event, delta, deltaX) {
        var scrollLeft = this.$('.ember-table-right-table-block').scrollLeft() +
            deltaX;
        this.set('scrollLeft', scrollLeft);
        event.preventDefault();
      },

      onTouchMove: function(event, deltaX) {
        var scrollLeft = this.$('.ember-table-right-table-block').scrollLeft() +
            deltaX;
        this.set('scrollLeft', scrollLeft);
        event.preventDefault();
      }
    });
  });
;define("ember-table/mixins/mouse-wheel-handler", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      onMouseWheel: Ember.K,

      didRender: function() {
        var _this = this;
        this._super();
        this.$().bind('mousewheel', function(event, delta, deltaX, deltaY) {
          Ember.run(_this, _this.onMouseWheel, event, delta, deltaX, deltaY);
        });
      },

      willDestroyElement: function() {
        var $elem = this.$();
        if ($elem) {
          $elem.unbind('mousewheel');
        }
        this._super();
      }
    });
  });
;define("ember-table/components/header-block", 
  ["ember","ember-table/mixins/table-block","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TableBlock = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend(TableBlock, {
      classNames: ['ember-table-header-block'],
      // TODO(new-api): Eliminate view alias
      itemView: 'header-row',
      itemViewClass: Ember.computed.alias('itemView'),

      content: Ember.computed(function() {
        return [this.get('columns')];
      }).property('columns'),

      onColumnsDidChange: Ember.observer('content', function() {
        var _this = this;
        Ember.run.schedule('afterRender', function() {
          if ((_this.get('_state') || _this.get('state')) !== 'inDOM') {
            return;
          }
          _this.$().scrollLeft(_this.get('scrollLeft'));
        });
      }),

      actions: {
        toggleTableCollapse: function() {
          this.sendAction('toggleTableCollapse');
        },

        columnDidSort: function(fromIndex, toIndex) {
          this.sendAction('columnDidSort', fromIndex, toIndex);
        },

        sortByColumn: function(column) {
          this.sendAction('sortByColumn', column);
        },

      }
    });
  });
;define("ember-table/components/header-cell", 
  ["ember","ember-table/mixins/style-bindings","ember-table/mixins/register-table-component","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];
    var RegisterTableComponentMixin = __dependency3__["default"];

    __exports__["default"] = Ember.Component.extend(
    StyleBindingsMixin, RegisterTableComponentMixin, {
      // ---------------------------------------------------------------------------
      // API - Inputs
      // ---------------------------------------------------------------------------

      // TODO: Doc
      classNames: ['ember-table-cell', 'ember-table-header-cell'],
      classNameBindings: ['column.isSortable:sortable', 'column.textAlign'],
      styleBindings: ['width', 'height'],

      // ---------------------------------------------------------------------------
      // Internal properties
      // ---------------------------------------------------------------------------

      column: Ember.computed.alias('content'),
      width: Ember.computed.alias('column.width'),
      minWidth: Ember.computed.alias('column.minWidth'),
      maxWidth: Ember.computed.alias('column.maxWidth'),
      nextResizableColumn: Ember.computed.alias('column.nextResizableColumn'),

      headerHeight: null,
      height: Ember.computed.alias('headerHeight'),
      columnMode: null,
      columnsFillTable: null,

      effectiveMinWidth: Ember.computed(function() {
        if (this.get('columnMode') === 'standard') {
          return this.get('minWidth');
        }
        var nextColumnMaxDiff = this.get('nextResizableColumn.maxWidth') -
            this.get('nextResizableColumn.width');
        if (this.get('minWidth') && nextColumnMaxDiff) {
          return Math.min(this.get('minWidth'), this.get('width') -
              nextColumnMaxDiff);
        } else if (this.get('minWidth')) {
          return this.get('minWidth');
        } else {
          return this.get('width') - nextColumnMaxDiff;
        }
      }).property('width', 'minWidth', 'columnMode',
          'nextResizableColumn.{width,maxWidth}'),

      effectiveMaxWidth: Ember.computed(function() {
        if (this.get('columnMode') === 'standard') {
          return this.get('maxWidth');
        }
        var nextColumnMaxDiff = this.get('nextResizableColumn.width') -
            this.get('nextResizableColumn.minWidth');
        if (this.get('maxWidth') && !Ember.isNone(nextColumnMaxDiff)) {
          return Math.min(this.get('maxWidth'), this.get('width') +
              nextColumnMaxDiff);
        } else if (this.get('maxWidth')) {
          return this.get('maxWidth');
        } else {
          return this.get('width') + nextColumnMaxDiff;
        }
      }).property('width', 'minWidth', 'columnMode',
          'nextResizableColumn.{width,minWidth}'),

      // jQuery UI resizable option
      resizableOption: Ember.computed(function() {
        return {
          handles: 'e', // Show the "east"/"right" handle
          // We need about 10px as absolute minimums for the columns
          minWidth: Math.max(this.get('effectiveMinWidth') || 0, 10),
          maxWidth: this.get('effectiveMaxWidth'),
          // TODO(azirbel): This is unexpected and needs documentation or removal
          grid: this.get('column.snapGrid'),
          resize: Ember.$.proxy(this.onColumnResize, this),
          stop: Ember.$.proxy(this.onColumnResize, this)
        };
      }).property('effectiveMinWidth', 'effectiveMaxWidth'),

      didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'didRenderCalculations');
      },
      didRenderCalculations: function() {
        this.elementSizeDidChange();
        this.recomputeResizableHandle();
      },

      willDestroyElement: function() {
        if (this.$().is('.ui-resizable')) {
          this.$().resizable('destroy');
        }

        Ember.run.cancel(this._scheduledElementSizeDidChange);

        this._super();
      },

      _isResizable: Ember.computed(function() {
        if (this.get('columnMode') === 'standard') {
          return this.get('column.isResizable');
        } else {
          return this.get('column.isResizable') && this.get('nextResizableColumn');
        }
      }).property('column.isResizable', 'columnMode',
          'nextResizableColumn'),

      // `event` here is a jQuery event
      onColumnResize: function(event, ui) {
        var newWidth = Math.round(ui.size.width);
        if (this.get('columnMode') === 'standard') {
          this.get('column').resize(newWidth);
          this.set('columnsFillTable', false);
        } else {
          var diff = this.get('width') - newWidth;
          this.get('column').resize(newWidth);
          this.get('nextResizableColumn').resize(
              this.get('nextResizableColumn.width') + diff);
        }

        this.elementSizeDidChange();

        // Trigger the table resize (and redraw of layout) when resizing is done
        if (event.type === 'resizestop') {
          this.get('tableComponent').elementSizeDidChange();
        }

        this.get('context').sendAction('onColumnResized', this.get('column'), newWidth);
      },

      /**
       * A Ember timer object representing a scheduled call to
       * `elementSizeDidChange`.
       * @private
       * @type {Object}
       */
      _scheduledElementSizeDidChange: null,

      elementSizeDidChange: function() {
        var maxHeight = 0;
        // TODO(Louis): This seems bad...
        Ember.$('.ember-table-header-block .ember-table-content').each(function() {
          var thisHeight = Ember.$(this).outerHeight();
          if (thisHeight > maxHeight) {
            maxHeight = thisHeight;
          }
        });

        this.set('tableComponent._contentHeaderHeight', maxHeight);
      },

      cellWidthDidChange: Ember.observer(function() {
        this._scheduledElementSizeDidChange = Ember.run.scheduleOnce('afterRender',
          this, this.elementSizeDidChange);
      }, 'width'),

      resizableObserver: Ember.observer('resizableOption', 'column.isResizable', 'columnMode',
          'nextResizableColumn', function() {
        this.recomputeResizableHandle();
      }),

      recomputeResizableHandle: function() {
        if (this.get('_isResizable')) {
          this.$().resizable(this.get('resizableOption'));
        } else {
          if (this.$().is('.ui-resizable')) {
            this.$().resizable('destroy');
          }
        }
      },

      actions: {
        toggleTableCollapse: function() {
          this.sendAction('toggleTableCollapse');
        },
        sortByColumn: function() {
          this.sendAction('sortByColumn', this.get('column'));
      },
      }
    });
  });
;define("ember-table/mixins/register-table-component", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Gives views access to the table component. With the current architecture,
    // this is necessary because views need access to the component's properties
    // (like height and columnMode) and may even need to call component functions
    // (trigger refresh layout).
    //
    // It is possible to override this behavior by passing your own tableComponent
    // to the views instead.
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      tableComponent: null,

      init: function() {
        if (!this.get('tableComponent')) {
          this.set('tableComponent', this.nearestWithProperty('isEmberTable'));
        }
        return this._super();
      }
    });
  });
;define("ember-table/components/header-row", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    // We hacked this. There is an inconsistency at the level in which we are
    // handling scroll event...
    __exports__["default"] = Ember.Component.extend(
    StyleBindingsMixin, {

      classNames: ['ember-table-table-row', 'ember-table-header-row'],
      styleBindings: ['width'],
      columns: Ember.computed.alias('content'),
      width: Ember.computed.alias('rowWidth'),

      rowWidth: null,
      enableColumnReorder: null,
      isShowingSortableIndicator: null,
      sortableIndicatorLeft: null,

      rowWidthSafeString: Ember.computed('rowWidth', function() {
        return new Ember.Handlebars.SafeString('width:' + this.get('rowWidth') + 'px;');
      }),

      // Options for jQuery UI sortable
      sortableOption: Ember.computed(function() {
        return {
          axis: 'x',
          containment: 'parent',
          cursor: 'move',
          helper: 'clone',
          items: ".ember-table-header-cell.sortable",
          opacity: 0.9,
          placeholder: 'ui-state-highlight',
          scroll: true,
          tolerance: 'pointer',
          start: Ember.$.proxy(this.onColumnSortStart, this),
          update: Ember.$.proxy(this.onColumnSortDone, this),
          stop: Ember.$.proxy(this.onColumnSortStop, this),
          sort: Ember.$.proxy(this.onColumnSortChange, this)
        };
      }),

      didRender: function() {
        this._super();
        if (this.get('enableColumnReorder')) {
          this.$('> div').sortable(this.get('sortableOption'));
        }
      },

      willDestroyElement: function() {
        if (this.get('enableColumnReorder')) {
          // TODO(azirbel): Get rid of this check, as in onColumnSortDone?
          var $divs = this.$('> div');
          if ($divs) {
            $divs.sortable('destroy');
          }
        }
        this._super();
      },

      //saving start position in ui.item object
      onColumnSortStart: function(event, ui) {
        ui.item.startPosition = ui.item.index();
      },

      onColumnSortStop: function() {
        this.set('isShowingSortableIndicator', false);
      },

      onColumnSortChange: function() {
        var left = this.$('.ui-state-highlight').offset().left -
            this.$().closest('.ember-table-tables-container').offset().left;
        this.set('isShowingSortableIndicator', true);
        this.set('sortableIndicatorLeft', left);
      },

      onColumnSortDone: function(event, ui) {
        var toIndex = ui.item.index();
        var fromIndex = ui.item.startPosition;
        this.$('> div').sortable('cancel');
        this.sendAction('columnDidSort', fromIndex, toIndex);
      },

      actions: {
        toggleTableCollapse: function() {
          this.sendAction('toggleTableCollapse');
        },

        sortByColumn: function(column) {
          this.sendAction('sortByColumn', column);
      },
      }
    });
  });
;define("ember-table/components/header-table-container", 
  ["ember","ember-table/mixins/table-container","ember-table/mixins/show-horizontal-scroll","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var TableContainer = __dependency2__["default"];
    var ShowHorizontalScrollMixin = __dependency3__["default"];

    __exports__["default"] = Ember.Component.extend( TableContainer,
    ShowHorizontalScrollMixin, {

      classNames: ['ember-table-table-container',
          'ember-table-fixed-table-container',
          'ember-table-header-container'],
      height: Ember.computed.alias('headerHeight'),
      width: Ember.computed.alias('tableContainerWidth'),

      numFixedColumns: null,
      fixedColumns: Ember.A,
      tableColumns: Ember.A,
      fixedBlockWidth: null,
      tableBlockWidth: null,
      headerHeight: null,
      tableContainerWidth: null,
      scrollLeft: null,

      actions: {
        toggleTableCollapse: function() {
          this.sendAction('toggleTableCollapse');
        },

        columnDidSort: function(fromIndex, toIndex) {
          this.sendAction('columnDidSort', fromIndex, toIndex);
        },
        
        sortByColumn: function(column) {
          this.sendAction('sortByColumn', column);
        },

      }
    });
  });
;define("ember-table/components/lazy-table-block", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend( StyleBindingsMixin, {
      classNames: ['lazy-list-container', 'ember-table-table-block'],
      styleBindings: ['width', 'height'],
      columns: null,
      scrollLeft: null,
      content: null,
      itemViewClass: null,
      rowHeight: null,
      scrollTop: 0,
      startIndex: null,
      blockWidth: null,

      height: Ember.computed(function() {
        return this.get('content.length') * this.get('rowHeight');
      }).property('content.length', 'rowHeight'),

      width: Ember.computed.alias('blockWidth'),

      lazyContent: Ember.computed('content.length', function(){
        var content = this.get('content') || Ember.A([]);
        return content.map(function(row) {
          row.set('isHovered', false);
          return row;
        });
      }),

      actions: {
        rowDidClick: function(row, event) {
          this.sendAction('rowDidClick', row, event);
        },

        scrollChange: function(scrollLeft, scrollTop) {
          this.sendAction('scrollChange', scrollLeft, scrollTop);
        },

        toggleRowCollapse: function(row) {
          this.sendAction('toggleRowCollapse', row);
        }
      }

    });
  });
;define("ember-table/components/scroll-container", 
  ["ember","ember-table/mixins/style-bindings","ember-table/mixins/scroll-handler","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];
    var ScrollHandlerMixin = __dependency3__["default"];

    __exports__["default"] = Ember.Component.extend(
    StyleBindingsMixin, ScrollHandlerMixin, {

      classNames: ['ember-table-scroll-container'],
      styleBindings: ['left', 'width', 'height'],
      scrollElementSelector: '.antiscroll-inner',

      scrollContainerWidth: null,
      fixedColumnsWidth: null,

      width: Ember.computed.alias('scrollContainerWidth'),
      // 10 is the height of the horizontal scrollbar
      height: 10,
      left: Ember.computed.alias('fixedColumnsWidth'),
      scrollLeft: 0,

      // `event` here is a jQuery event
      onScroll: function(event) {
        this.sendAction('scrollLeftDidChange', event.target.scrollLeft);
        event.preventDefault();
      },

      onScrollLeftDidChange: Ember.observer('scrollLeft', 'scrollElementSelector', function() {
        var selector = this.get('scrollElementSelector');
        this.$(selector).scrollLeft(this.get('scrollLeft'));
      })
    });
  });
;define("ember-table/components/scroll-panel", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend(
    StyleBindingsMixin, {
      classNames: ['ember-table-scroll-panel'],
      styleBindings: ['width', 'height'],
      width: Ember.computed.alias('tableColumnsWidth'),
      height: Ember.computed.alias('tableContentHeight'),

      tableColumnsWidth: null,
      tableContentHeight: null

    });
  });
;define("ember-table/components/table-cell", 
  ["ember","ember-table/mixins/style-bindings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];

    __exports__["default"] = Ember.Component.extend( StyleBindingsMixin, {
      // ---------------------------------------------------------------------------
      // API - Inputs
      // ---------------------------------------------------------------------------

      // TODO: Doc

      classNames: ['ember-table-cell'],
      classNameBindings: 'column.textAlign',
      styleBindings: 'width',

      // ---------------------------------------------------------------------------
      // Internal properties
      // ---------------------------------------------------------------------------

      init: function() {
        this._super();
        this.contentPathDidChange();
        this.contentDidChange();
      },

      row: null,
      column: Ember.computed.alias('content'),
      width: Ember.computed.alias('column.width'),

      contentDidChange: function() {
        this.notifyPropertyChange('cellContent');
      },

      contentPathDidChange: Ember.observer('column.contentPath', function() {
        var newContentPath = this.get('column.contentPath');
        var oldContentPath = this._oldContentPath;

        if (newContentPath !== oldContentPath) {
          if (oldContentPath) {
             this.removeObserver("row." + oldContentPath, this, this.contentDidChange);
          }
          this._oldContentPath = newContentPath;
          if (newContentPath) {
            this.addObserver("row." + newContentPath, this, this.contentDidChange);
          }
        }
      }),

      cellContent: Ember.computed('row.isLoaded', 'column', {
        set: function(key, value) {
          var row = this.get('row');
          var column = this.get('column');
          if (!row || !column) {
            return;
          }
          column.setCellContent(row, value);
          return value;
        },
        get: function() {
          var row = this.get('row');
          var column = this.get('column');
          if (!row || !column) {
            return;
          }
          var value = column.getCellContent(row);
          return value;
        }
      }),

      actions: {
        toggleRowCollapse: function(row) {
          this.sendAction('toggleRowCollapse', row);
        }
      }
    });
  });
;define("ember-table/components/table-row", 
  ["ember","ember-table/mixins/style-bindings","ember-table/mixins/register-table-component","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var StyleBindingsMixin = __dependency2__["default"];
    var RegisterTableComponentMixin = __dependency3__["default"];

    __exports__["default"] = Ember.Component.extend(
    RegisterTableComponentMixin, StyleBindingsMixin, {

      classNames: 'ember-table-table-row',
      classNameBindings: ['row.isHovered:ember-table-hover',
          'row.isSelected:ember-table-selected',
          'row.rowStyle',
          'isLastRow:ember-table-last-row'],
      styleBindings: ['width', 'height', 'top', 'display'],
      row: Ember.computed.alias('content'),
      columns: Ember.A,
      width: Ember.computed.alias('rowWidth'),
      height: Ember.computed.alias('rowHeight'),

      rowWidthSafeString: Ember.computed('rowWidth', function() {
        return new Ember.Handlebars.SafeString('width:' + this.get('rowWidth') + 'px;');
      }),

      prepareContent: Ember.K,

      top: Ember.computed(function() {
        return 0; //this.get('row.itemIndex') * this.get('rowHeight');
      }).property('row.itemIndex', 'rowHeight'),

      // TODO(azirbel): Add explicit else case
      display: Ember.computed(function() {
        if (!this.get('content')) {
          return 'none';
        }
      }).property('content'),

      // Use `lastItem` (set manually) instead of the array's built-in `lastObject`
      // to avoid creating a controller for last row on table initialization.  If
      // this TableRow is the last row, then the row controller should have been
      // created and set to `lastItem` in RowArrayController, otherwise `lastItem`
      // is null.
      // (Artych) What should be done here?
      isLastRow: Ember.computed(function() {
        return this.get('row') ===
            this.get('tableComponent.bodyContent.lastItem');
      }).property('tableComponent.bodyContent.lastItem', 'row'),

      // TODO(azirbel): Could simplify slightly via
      // this.set('row.isHovered', true) and remove the temp variable.
      // Also applies below/elsewhere.
      mouseEnter: function() {
        var row = this.get('row');
        if (row) {
          row.set('isHovered', true);
        }
      },

      mouseLeave: function() {
        var row = this.get('row');
        if (row) {
          row.set('isHovered', false);
        }
      },

      click: function(event) {
        var row = this.get('row');
        if (row) {
          this.sendAction('rowDidClick', this.get('row'), event);
        }
      },

      actions: {
        toggleRowCollapse: function(row) {
          this.sendAction('toggleRowCollapse', row);
        }
      }
    });
  });
;define("ember-table/models/column-definition", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Object.extend({
      // ---------------------------------------------------------------------------
      // API - Inputs
      // ---------------------------------------------------------------------------

      // Name of the column, to be displayed in the header.
      // TODO(new-api): Change to `columnName`
      headerCellName: undefined,

      // Path of the content for this cell. If the row object is a hash of keys
      // and values to specify data for each column, `contentPath` corresponds to
      // the key.
      contentPath: undefined,

      // Minimum column width. Affects both manual resizing and automatic resizing.
      minWidth: 25,

      // Maximum column width. Affects both manual resizing and automatic resizing.
      maxWidth: undefined,

      // The initial column width in pixels. Updated whenever the column (not
      // window) is resized. Can be persisted.
      savedWidth: 150,

      // Whether the column can be manually resized.
      isResizable: true,

      // Whether the column can be rearranged with other columns. Only matters if
      // the table's `enableColumnReorder` property is set to true (the default).
      // TODO(new-api): Rename to `isReorderable`
      isSortable: true,

      // Alignment of the text in the cell. Possible values are "left", "center",
      // and "right".
      textAlign: 'text-align-right',

      // Whether the column can automatically resize to fill space in the table.
      canAutoResize: false,

      // TODO(new-api): Remove `headerCellViewClass`
      // Override to specify a custom view to use for the header cell.
      headerCellView: 'header-cell',
      headerCellViewClass: Ember.computed.alias('headerCellView'),

      // TODO(new-api): Remove `tableCellViewClass`
      // Override to specify a custom view to use for table cells.
      tableCellView: 'table-cell',
      tableCellViewClass: Ember.computed.alias('tableCellView'),

      // Override to customize how the column gets data from each row object.
      // Given a row, should return a formatted cell value, e.g. $20,000,000.
      getCellContent: function(row) {
        var path = this.get('contentPath');
        Ember.assert("You must either provide a contentPath or override " +
                     "getCellContent in your column definition", path != null);
        return Ember.get(row, path);
      },

      // Override to maintain a consistent path to update cell values.
      // Recommended to make this a function which takes (row, value) and updates
      // the row value.
      setCellContent: Ember.K,

      // ---------------------------------------------------------------------------
      // Internal properties
      // ---------------------------------------------------------------------------

      // In most cases, should be set by the table and not overridden externally.
      // Instead, use savedWidth and minWidth/maxWidth along with resize behavior.
      width: Ember.computed.oneWay('savedWidth'),

      // Not part of the official API, but can be overridden if you need custom
      // behavior (e.g. persistence) when the column is resized, and `savedWidth`
      // doesn't solve your problem.
      resize: function(width) {
        this.set('savedWidth', width);
        this.set('width', width);
      },

      // Set when the table is initialized. Used to resize columns by stealing
      // width from the next column to the right.
      nextColumn: null,
      prevColumn: null,

      isAtMinWidth: Ember.computed(function() {
        return this.get('width') === this.get('minWidth');
      }).property('width', 'minWidth'),

      isAtMaxWidth: Ember.computed(function() {
        return this.get('width') === this.get('maxWidth');
      }).property('width', 'maxWidth')
    });
  });
;define("ember-table/templates/components/body-table-container", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 6
              },
              "end": {
                "line": 19,
                "column": 6
              }
            },
            "moduleName": "components/body-table-container.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","lazy-table-block",[],["content",["subexpr","@mut",[["get","bodyContent",["loc",[null,[6,18],[6,29]]]]],[],[]],"columns",["subexpr","@mut",[["get","fixedColumns",["loc",[null,[7,18],[7,30]]]]],[],[]],"blockWidth",["subexpr","@mut",[["get","fixedBlockWidth",["loc",[null,[8,21],[8,36]]]]],[],[]],"scrollTop",["subexpr","@mut",[["get","_scrollTop",["loc",[null,[9,20],[9,30]]]]],[],[]],"itemViewClass",["subexpr","@mut",[["get","itemViewClass",["loc",[null,[10,24],[10,37]]]]],[],[]],"height",["subexpr","@mut",[["get","bodyHeight",["loc",[null,[11,17],[11,27]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","rowHeight",["loc",[null,[12,20],[12,29]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[13,19],[13,27]]]]],[],[]],"rowDidClick","rowDidClick","scrollChange","scrollTopChange","toggleRowCollapse","toggleRowCollapse","class","ember-table-left-table-block"],["loc",[null,[5,8],[18,10]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 38,
              "column": 0
            }
          },
          "moduleName": "components/body-table-container.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","antiscroll-box");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","antiscroll-inner");
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","ember-table-table-scrollable-wrapper");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("      ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0, 1, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0,1,1);
          morphs[1] = dom.createMorphAt(element0,3,3);
          return morphs;
        },
        statements: [
          ["block","if",[["get","numFixedColumns",["loc",[null,[4,12],[4,27]]]]],[],0,null,["loc",[null,[4,6],[19,13]]]],
          ["inline","lazy-table-block",[],["content",["subexpr","@mut",[["get","bodyContent",["loc",[null,[21,16],[21,27]]]]],[],[]],"columns",["subexpr","@mut",[["get","tableColumns",["loc",[null,[22,16],[22,28]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","scrollLeft",["loc",[null,[23,19],[23,29]]]]],[],[]],"scrollTop",["subexpr","@mut",[["get","_scrollTop",["loc",[null,[24,18],[24,28]]]]],[],[]],"blockWidth",["subexpr","@mut",[["get","tableBlockWidth",["loc",[null,[25,19],[25,34]]]]],[],[]],"itemViewClass",["subexpr","@mut",[["get","itemViewClass",["loc",[null,[26,22],[26,35]]]]],[],[]],"height",["subexpr","@mut",[["get","bodyHeight",["loc",[null,[27,15],[27,25]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","rowHeight",["loc",[null,[28,18],[28,27]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[29,17],[29,25]]]]],[],[]],"rowDidClick","rowDidClick","scrollChange","scrollChange","toggleRowCollapse","toggleRowCollapse","class","ember-table-right-table-block"],["loc",[null,[20,6],[34,8]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/ember-table", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 1,
                "column": 0
              },
              "end": {
                "line": 21,
                "column": 0
              }
            },
            "moduleName": "components/ember-table.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","header-table-container",[],["numFixedColumns",["subexpr","@mut",[["get","numFixedColumns",["loc",[null,[3,21],[3,36]]]]],[],[]],"tableColumns",["subexpr","@mut",[["get","tableColumns",["loc",[null,[4,18],[4,30]]]]],[],[]],"fixedColumns",["subexpr","@mut",[["get","fixedColumns",["loc",[null,[5,18],[5,30]]]]],[],[]],"fixedBlockWidth",["subexpr","@mut",[["get","_fixedBlockWidth",["loc",[null,[6,21],[6,37]]]]],[],[]],"tableBlockWidth",["subexpr","@mut",[["get","_tableBlockWidth",["loc",[null,[7,21],[7,37]]]]],[],[]],"headerHeight",["subexpr","@mut",[["get","_headerHeight",["loc",[null,[8,18],[8,31]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","_rowWidth",["loc",[null,[9,14],[9,23]]]]],[],[]],"tableContainerWidth",["subexpr","@mut",[["get","_tableContainerWidth",["loc",[null,[10,25],[10,45]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","_tableScrollLeft",["loc",[null,[11,16],[11,32]]]]],[],[]],"enableColumnReorder",["subexpr","@mut",[["get","enableColumnReorder",["loc",[null,[12,25],[12,44]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","_isShowingSortableIndicator",["loc",[null,[13,32],[13,59]]]]],[],[]],"sortableIndicatorLeft",["subexpr","@mut",[["get","_sortableIndicatorLeft",["loc",[null,[14,27],[14,49]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[15,16],[15,26]]]]],[],[]],"columnsFillTable",["subexpr","@mut",[["get","columnsFillTable",["loc",[null,[16,22],[16,38]]]]],[],[]],"toggleTableCollapse","toggleTableCollapse","columnDidSort","columnDidSort","sortByColumn","sortByColumn"],["loc",[null,[2,2],[20,4]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 38,
                "column": 0
              },
              "end": {
                "line": 55,
                "column": 0
              }
            },
            "moduleName": "components/ember-table.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","footer-table-container",[],["footerContent",["subexpr","@mut",[["get","footerContent",["loc",[null,[40,20],[40,33]]]]],[],[]],"numFixedColumns",["subexpr","@mut",[["get","numFixedColumns",["loc",[null,[41,22],[41,37]]]]],[],[]],"itemViewClass",["subexpr","@mut",[["get","tableRowViewClass",["loc",[null,[42,20],[42,37]]]]],[],[]],"tableColumns",["subexpr","@mut",[["get","tableColumns",["loc",[null,[43,19],[43,31]]]]],[],[]],"fixedColumns",["subexpr","@mut",[["get","fixedColumns",["loc",[null,[44,19],[44,31]]]]],[],[]],"fixedBlockWidth",["subexpr","@mut",[["get","_fixedBlockWidth",["loc",[null,[45,22],[45,38]]]]],[],[]],"tableBlockWidth",["subexpr","@mut",[["get","_tableBlockWidth",["loc",[null,[46,22],[46,38]]]]],[],[]],"footerHeight",["subexpr","@mut",[["get","footerHeight",["loc",[null,[47,19],[47,31]]]]],[],[]],"tableContainerWidth",["subexpr","@mut",[["get","_tableContainerWidth",["loc",[null,[48,26],[48,46]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","_tableScrollLeft",["loc",[null,[49,17],[49,33]]]]],[],[]],"headerHeight",["subexpr","@mut",[["get","_headerHeight",["loc",[null,[50,19],[50,32]]]]],[],[]],"tableContentHeight",["subexpr","@mut",[["get","_tableContentHeight",["loc",[null,[51,25],[51,44]]]]],[],[]],"bodyHeight",["subexpr","@mut",[["get","_bodyHeight",["loc",[null,[52,17],[52,28]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","_rowWidth",["loc",[null,[53,15],[53,24]]]]],[],[]]],["loc",[null,[39,2],[54,4]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 70,
              "column": 0
            }
          },
          "moduleName": "components/ember-table.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(5);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          morphs[1] = dom.createMorphAt(fragment,1,1,contextualElement);
          morphs[2] = dom.createMorphAt(fragment,3,3,contextualElement);
          morphs[3] = dom.createMorphAt(fragment,4,4,contextualElement);
          morphs[4] = dom.createMorphAt(fragment,6,6,contextualElement);
          dom.insertBoundary(fragment, 0);
          return morphs;
        },
        statements: [
          ["block","if",[["get","hasHeader",["loc",[null,[1,6],[1,15]]]]],[],0,null,["loc",[null,[1,0],[21,7]]]],
          ["inline","body-table-container",[],["bodyContent",["subexpr","@mut",[["get","bodyContent",["loc",[null,[23,14],[23,25]]]]],[],[]],"numFixedColumns",["subexpr","@mut",[["get","numFixedColumns",["loc",[null,[24,18],[24,33]]]]],[],[]],"itemViewClass",["subexpr","@mut",[["get","tableRowViewClass",["loc",[null,[25,16],[25,33]]]]],[],[]],"tableColumns",["subexpr","@mut",[["get","tableColumns",["loc",[null,[26,14],[26,26]]]]],[],[]],"fixedColumns",["subexpr","@mut",[["get","fixedColumns",["loc",[null,[27,14],[27,26]]]]],[],[]],"fixedBlockWidth",["subexpr","@mut",[["get","_fixedBlockWidth",["loc",[null,[28,17],[28,33]]]]],[],[]],"tableBlockWidth",["subexpr","@mut",[["get","_tableBlockWidth",["loc",[null,[29,17],[29,33]]]]],[],[]],"bodyHeight",["subexpr","@mut",[["get","_bodyHeight",["loc",[null,[30,13],[30,24]]]]],[],[]],"bodyWidth",["subexpr","@mut",[["get","_width",["loc",[null,[31,12],[31,18]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","rowHeight",["loc",[null,[32,12],[32,21]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","_rowWidth",["loc",[null,[33,11],[33,20]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","_tableScrollLeft",["loc",[null,[34,13],[34,29]]]]],[],[]],"rowDidClick","rowDidClick","toggleRowCollapse","toggleRowCollapse"],["loc",[null,[22,0],[37,2]]]],
          ["block","if",[["get","hasFooter",["loc",[null,[38,6],[38,15]]]]],[],1,null,["loc",[null,[38,0],[55,7]]]],
          ["inline","scroll-container",[],["scrollContainerWidth",["subexpr","@mut",[["get","_scrollContainerWidth",["loc",[null,[57,25],[57,46]]]]],[],[]],"fixedColumnsWidth",["subexpr","@mut",[["get","_fixedColumnsWidth",["loc",[null,[58,22],[58,40]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","_tableScrollLeft",["loc",[null,[59,15],[59,31]]]]],[],[]],"tableColumnsWidth",["subexpr","@mut",[["get","_tableColumnsWidth",["loc",[null,[60,22],[60,40]]]]],[],[]],"tableContentHeight",["subexpr","@mut",[["get","_tableContentHeight",["loc",[null,[61,23],[61,42]]]]],[],[]],"scrollLeftDidChange","scrollLeftDidChange"],["loc",[null,[56,0],[64,2]]]],
          ["inline","column-sortable-indicator",[],["sortableIndicatorLeft",["subexpr","@mut",[["get","_sortableIndicatorLeft",["loc",[null,[66,25],[66,47]]]]],[],[]],"tableHeight",["subexpr","@mut",[["get","_height",["loc",[null,[67,15],[67,22]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","_isShowingSortableIndicator",["loc",[null,[68,30],[68,57]]]]],[],[]]],["loc",[null,[65,0],[69,2]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }()));
  });
;define("ember-table/templates/components/footer-block", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 1,
                "column": 0
              },
              "end": {
                "line": 13,
                "column": 0
              }
            },
            "moduleName": "components/footer-block.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("	");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","component",[["get","itemViewClass",["loc",[null,[2,13],[2,26]]]]],["content",["subexpr","@mut",[["get","item",["loc",[null,[3,10],[3,14]]]]],[],[]],"columns",["subexpr","@mut",[["get","columns",["loc",[null,[4,10],[4,17]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[5,11],[5,19]]]]],[],[]],"enableColumnReorder",["subexpr","@mut",[["get","enableColumnReorder",["loc",[null,[6,25],[6,44]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","isShowingSortableIndicator",["loc",[null,[7,31],[7,57]]]]],[],[]],"sortableIndicatorLeft",["subexpr","@mut",[["get","sortableIndicatorLeft",["loc",[null,[8,26],[8,47]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","rowHeight",["loc",[null,[9,14],[9,23]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[10,15],[10,25]]]]],[],[]],"columnsFillTable",["subexpr","@mut",[["get","columnsFillTable",["loc",[null,[11,21],[11,37]]]]],[],[]]],["loc",[null,[2,1],[12,3]]]]
          ],
          locals: ["item"],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 13,
              "column": 9
            }
          },
          "moduleName": "components/footer-block.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","each",[["get","content",["loc",[null,[1,8],[1,15]]]]],[],0,null,["loc",[null,[1,0],[13,9]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/footer-table-container", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 12,
                "column": 2
              }
            },
            "moduleName": "components/footer-table-container.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","footer-block",[],["itemViewClass",["subexpr","@mut",[["get","itemViewClass",["loc",[null,[4,20],[4,33]]]]],[],[]],"content",["subexpr","@mut",[["get","footerContent",["loc",[null,[5,14],[5,27]]]]],[],[]],"columns",["subexpr","@mut",[["get","fixedColumns",["loc",[null,[6,14],[6,26]]]]],[],[]],"blockWidth",["subexpr","@mut",[["get","fixedBlockWidth",["loc",[null,[7,17],[7,32]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[8,15],[8,23]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","footerHeight",["loc",[null,[9,16],[9,28]]]]],[],[]],"class","ember-table-left-table-block"],["loc",[null,[3,4],[11,6]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 24,
              "column": 0
            }
          },
          "moduleName": "components/footer-table-container.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ember-table-table-fixed-wrapper");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0,1,1);
          morphs[1] = dom.createMorphAt(element0,3,3);
          return morphs;
        },
        statements: [
          ["block","if",[["get","numFixedColumns",["loc",[null,[2,8],[2,23]]]]],[],0,null,["loc",[null,[2,2],[12,9]]]],
          ["inline","footer-block",[],["itemViewClass",["subexpr","@mut",[["get","itemViewClass",["loc",[null,[14,18],[14,31]]]]],[],[]],"content",["subexpr","@mut",[["get","footerContent",["loc",[null,[15,12],[15,25]]]]],[],[]],"columns",["subexpr","@mut",[["get","tableColumns",["loc",[null,[16,12],[16,24]]]]],[],[]],"blockWidth",["subexpr","@mut",[["get","tableBlockWidth",["loc",[null,[17,15],[17,30]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","scrollLeft",["loc",[null,[18,15],[18,25]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[19,13],[19,21]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","footerHeight",["loc",[null,[20,14],[20,26]]]]],[],[]],"class","ember-table-right-table-block"],["loc",[null,[13,2],[22,4]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/header-block", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 1,
                "column": 0
              },
              "end": {
                "line": 15,
                "column": 0
              }
            },
            "moduleName": "components/header-block.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("	");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","component",[["get","itemViewClass",["loc",[null,[2,13],[2,26]]]]],["content",["subexpr","@mut",[["get","item",["loc",[null,[3,10],[3,14]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[4,11],[4,19]]]]],[],[]],"enableColumnReorder",["subexpr","@mut",[["get","enableColumnReorder",["loc",[null,[5,25],[5,44]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","isShowingSortableIndicator",["loc",[null,[6,31],[6,57]]]]],[],[]],"sortableIndicatorLeft",["subexpr","@mut",[["get","sortableIndicatorLeft",["loc",[null,[7,26],[7,47]]]]],[],[]],"headerHeight",["subexpr","@mut",[["get","headerHeight",["loc",[null,[8,17],[8,29]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[9,15],[9,25]]]]],[],[]],"columnsFillTable",["subexpr","@mut",[["get","columnsFillTable",["loc",[null,[10,21],[10,37]]]]],[],[]],"toggleTableCollapse","toggleTableCollapse","columnDidSort","columnDidSort","sortByColumn","sortByColumn"],["loc",[null,[2,1],[14,3]]]]
          ],
          locals: ["item"],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 16,
              "column": 0
            }
          },
          "moduleName": "components/header-block.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","each",[["get","content",["loc",[null,[1,8],[1,15]]]]],[],0,null,["loc",[null,[1,0],[15,9]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/header-cell", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 6
            }
          },
          "moduleName": "components/header-cell.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ember-table-content-container");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","ember-table-content");
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
          return morphs;
        },
        statements: [
          ["element","action",["sortByColumn",["get","content",["loc",[null,[1,67],[1,74]]]]],[],["loc",[null,[1,43],[1,76]]]],
          ["content","content.headerCellName",["loc",[null,[3,4],[3,30]]]]
        ],
        locals: [],
        templates: []
      };
    }()));
  });
;define("ember-table/templates/components/header-row", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 0
              },
              "end": {
                "line": 11,
                "column": 0
              }
            },
            "moduleName": "components/header-row.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("	");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","component",[["get","item.headerCellViewClass",["loc",[null,[3,13],[3,37]]]]],["content",["subexpr","@mut",[["get","item",["loc",[null,[4,13],[4,17]]]]],[],[]],"headerHeight",["subexpr","@mut",[["get","headerHeight",["loc",[null,[5,18],[5,30]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[6,15],[6,25]]]]],[],[]],"columnsFillTable",["subexpr","@mut",[["get","columnsFillTable",["loc",[null,[7,21],[7,37]]]]],[],[]],"toggleTableCollapse","toggleTableCollapse","sortByColumn","sortByColumn"],["loc",[null,[3,1],[10,3]]]]
          ],
          locals: ["item"],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 13,
              "column": 0
            }
          },
          "moduleName": "components/header-row.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element0, 'style');
          morphs[1] = dom.createMorphAt(element0,1,1);
          return morphs;
        },
        statements: [
          ["attribute","style",["get","rowWidthSafeString",["loc",[null,[1,13],[1,31]]]]],
          ["block","each",[["get","content",["loc",[null,[2,8],[2,15]]]]],[],0,null,["loc",[null,[2,0],[11,9]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/header-table-container", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 19,
                "column": 2
              }
            },
            "moduleName": "components/header-table-container.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","header-block",[],["columns",["subexpr","@mut",[["get","fixedColumns",["loc",[null,[4,14],[4,26]]]]],[],[]],"blockWidth",["subexpr","@mut",[["get","fixedBlockWidth",["loc",[null,[5,17],[5,32]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[6,15],[6,23]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","headerHeight",["loc",[null,[7,16],[7,28]]]]],[],[]],"headerHeight",["subexpr","@mut",[["get","headerHeight",["loc",[null,[8,19],[8,31]]]]],[],[]],"enableColumnReorder",["subexpr","@mut",[["get","enableColumnReorder",["loc",[null,[9,26],[9,45]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","isShowingSortableIndicator",["loc",[null,[10,33],[10,59]]]]],[],[]],"sortableIndicatorLeft",["subexpr","@mut",[["get","sortableIndicatorLeft",["loc",[null,[11,28],[11,49]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[12,17],[12,27]]]]],[],[]],"columnsFillTable",["subexpr","@mut",[["get","columnsFillTable",["loc",[null,[13,23],[13,39]]]]],[],[]],"toggleTableCollapse","toggleTableCollapse","columnDidSort","columnDidSort","sortByColumn","sortByColumn","class","ember-table-left-table-block"],["loc",[null,[3,4],[18,6]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 36,
              "column": 0
            }
          },
          "moduleName": "components/header-table-container.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ember-table-table-fixed-wrapper");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0,1,1);
          morphs[1] = dom.createMorphAt(element0,3,3);
          return morphs;
        },
        statements: [
          ["block","if",[["get","numFixedColumns",["loc",[null,[2,8],[2,23]]]]],[],0,null,["loc",[null,[2,2],[19,9]]]],
          ["inline","header-block",[],["columns",["subexpr","@mut",[["get","tableColumns",["loc",[null,[21,12],[21,24]]]]],[],[]],"scrollLeft",["subexpr","@mut",[["get","scrollLeft",["loc",[null,[22,15],[22,25]]]]],[],[]],"blockWidth",["subexpr","@mut",[["get","tableBlockWidth",["loc",[null,[23,15],[23,30]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[24,13],[24,21]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","headerHeight",["loc",[null,[25,14],[25,26]]]]],[],[]],"headerHeight",["subexpr","@mut",[["get","headerHeight",["loc",[null,[26,17],[26,29]]]]],[],[]],"enableColumnReorder",["subexpr","@mut",[["get","enableColumnReorder",["loc",[null,[27,24],[27,43]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","isShowingSortableIndicator",["loc",[null,[28,31],[28,57]]]]],[],[]],"sortableIndicatorLeft",["subexpr","@mut",[["get","sortableIndicatorLeft",["loc",[null,[29,26],[29,47]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[30,15],[30,25]]]]],[],[]],"columnDidSort","columnDidSort","sortByColumn","sortByColumn","class","ember-table-right-table-block"],["loc",[null,[20,2],[34,4]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/lazy-table-block", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 1,
                "column": 0
              },
              "end": {
                "line": 23,
                "column": 0
              }
            },
            "moduleName": "components/lazy-table-block.hbs"
          },
          arity: 2,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("	");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","component",[["get","itemViewClass",["loc",[null,[10,13],[10,26]]]]],["content",["subexpr","@mut",[["get","item",["loc",[null,[11,10],[11,14]]]]],[],[]],"columns",["subexpr","@mut",[["get","columns",["loc",[null,[12,10],[12,17]]]]],[],[]],"enableColumnReorder",["subexpr","@mut",[["get","enableColumnReorder",["loc",[null,[13,24],[13,43]]]]],[],[]],"isShowingSortableIndicator",["subexpr","@mut",[["get","isShowingSortableIndicator",["loc",[null,[14,31],[14,57]]]]],[],[]],"sortableIndicatorLeft",["subexpr","@mut",[["get","sortableIndicatorLeft",["loc",[null,[15,26],[15,47]]]]],[],[]],"rowHeight",["subexpr","@mut",[["get","rowHeight",["loc",[null,[16,14],[16,23]]]]],[],[]],"rowWidth",["subexpr","@mut",[["get","rowWidth",["loc",[null,[17,13],[17,21]]]]],[],[]],"columnMode",["subexpr","@mut",[["get","columnMode",["loc",[null,[18,15],[18,25]]]]],[],[]],"columnsFillTable",["subexpr","@mut",[["get","columnsFillTable",["loc",[null,[19,21],[19,37]]]]],[],[]],"rowDidClick","rowDidClick","toggleRowCollapse","toggleRowCollapse"],["loc",[null,[10,1],[22,3]]]]
          ],
          locals: ["item","index"],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 24,
              "column": 0
            }
          },
          "moduleName": "components/lazy-table-block.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","ember-collection",[],["items",["subexpr","@mut",[["get","lazyContent",["loc",[null,[2,8],[2,19]]]]],[],[]],"itemHeight",["subexpr","@mut",[["get","rowHeight",["loc",[null,[3,13],[3,22]]]]],[],[]],"height",["subexpr","@mut",[["get","bodyHeight",["loc",[null,[4,9],[4,19]]]]],[],[]],"scroll-left",["subexpr","@mut",[["get","scrollLeft",["loc",[null,[5,14],[5,24]]]]],[],[]],"scroll-top",["subexpr","@mut",[["get","scrollTop",["loc",[null,[6,13],[6,22]]]]],[],[]],"scroll-change",["subexpr","action",["scrollChange"],[],["loc",[null,[7,16],[7,39]]]],"cell-layout",["subexpr","fixed-grid-layout",[["get","rowWidth",["loc",[null,[8,33],[8,41]]]],["get","rowHeight",["loc",[null,[8,42],[8,51]]]]],[],["loc",[null,[8,14],[8,52]]]]],0,null,["loc",[null,[1,0],[23,21]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define("ember-table/templates/components/scroll-container", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 9,
              "column": 0
            }
          },
          "moduleName": "components/scroll-container.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","antiscroll-wrap");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","antiscroll-inner");
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","scroll-panel",[],["tableColumnsWidth",["subexpr","@mut",[["get","tableColumnsWidth",["loc",[null,[4,25],[4,42]]]]],[],[]],"tableContentHeight",["subexpr","@mut",[["get","tableContentHeight",["loc",[null,[5,26],[5,44]]]]],[],[]]],["loc",[null,[3,4],[6,6]]]]
        ],
        locals: [],
        templates: []
      };
    }()));
  });
;define("ember-table/templates/components/table-cell", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 3,
              "column": 7
            }
          },
          "moduleName": "components/table-cell.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","ember-table-content");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
          return morphs;
        },
        statements: [
          ["content","cellContent",["loc",[null,[2,2],[2,17]]]]
        ],
        locals: [],
        templates: []
      };
    }()));
  });
;define("ember-table/templates/components/table-row", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.13",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 0
              },
              "end": {
                "line": 8,
                "column": 0
              }
            },
            "moduleName": "components/table-row.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("	");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","component",[["get","item.tableCellViewClass",["loc",[null,[3,13],[3,36]]]]],["content",["subexpr","@mut",[["get","item",["loc",[null,[4,13],[4,17]]]]],[],[]],"row",["subexpr","@mut",[["get","row",["loc",[null,[5,9],[5,12]]]]],[],[]],"toggleRowCollapse","toggleRowCollapse"],["loc",[null,[3,1],[7,3]]]]
          ],
          locals: ["item"],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.13",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 10,
              "column": 0
            }
          },
          "moduleName": "components/table-row.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [0]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element0, 'style');
          morphs[1] = dom.createMorphAt(element0,1,1);
          return morphs;
        },
        statements: [
          ["attribute","style",["get","rowWidthSafeString",["loc",[null,[1,13],[1,31]]]]],
          ["block","each",[["get","columns",["loc",[null,[2,8],[2,15]]]]],[],0,null,["loc",[null,[2,0],[8,9]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }()));
  });
;define('ember', ['exports'], function(__exports__) {
  __exports__['default'] = window.Ember;
});

window.Ember.Table = Ember.Namespace.create();
window.Ember.AddeparMixins = {};
window.Ember.TEMPLATES['components/body-table-container'] = require('ember-table/templates/components/body-table-container')['default'];
window.Ember.TEMPLATES['components/ember-table'] = require('ember-table/templates/components/ember-table')['default'];
window.Ember.TEMPLATES['components/footer-block'] = require('ember-table/templates/components/footer-block')['default'];
window.Ember.TEMPLATES['components/footer-table-container'] = require('ember-table/templates/components/footer-table-container')['default'];
window.Ember.TEMPLATES['components/header-block'] = require('ember-table/templates/components/header-block')['default'];
window.Ember.TEMPLATES['components/header-cell'] = require('ember-table/templates/components/header-cell')['default'];
window.Ember.TEMPLATES['components/header-row'] = require('ember-table/templates/components/header-row')['default'];
window.Ember.TEMPLATES['components/header-table-container'] = require('ember-table/templates/components/header-table-container')['default'];
window.Ember.TEMPLATES['components/lazy-table-block'] = require('ember-table/templates/components/lazy-table-block')['default'];
window.Ember.TEMPLATES['components/scroll-container'] = require('ember-table/templates/components/scroll-container')['default'];
window.Ember.TEMPLATES['components/table-cell'] = require('ember-table/templates/components/table-cell')['default'];
window.Ember.TEMPLATES['components/table-row'] = require('ember-table/templates/components/table-row')['default'];
window.Ember.Table.EmberTableComponent = require('ember-table/components/ember-table')['default'];
window.Ember.Table.RowArrayController = require('ember-table/controllers/row-array')['default'];
window.Ember.Table.Row = require('ember-table/controllers/row')['default'];
window.Ember.MouseWheelHandlerMixin = require('ember-table/mixins/mouse-wheel-handler')['default'];
window.Ember.Table.RegisterTableComponentMixin = require('ember-table/mixins/register-table-component')['default'];
window.Ember.AddeparMixins.ResizeHandlerMixin = require('ember-table/mixins/resize-handler')['default'];
window.Ember.ScrollHandlerMixin = require('ember-table/mixins/scroll-handler')['default'];
window.Ember.Table.ShowHorizontalScrollMixin = require('ember-table/mixins/show-horizontal-scroll')['default'];
window.Ember.AddeparMixins.StyleBindingsMixin = require('ember-table/mixins/style-bindings')['default'];
window.Ember.TouchMoveHandlerMixin = require('ember-table/mixins/touch-move-handler')['default'];
window.Ember.Table.ColumnDefinition = require('ember-table/models/column-definition')['default'];
window.Ember.Table.BodyTableContainer = require('ember-table/views/body-table-container')['default'];
window.Ember.Table.ColumnSortableIndicator = require('ember-table/views/column-sortable-indicator')['default'];
window.Ember.Table.FooterTableContainer = require('ember-table/views/footer-table-container')['default'];
window.Ember.Table.HeaderBlock = require('ember-table/views/header-block')['default'];
window.Ember.Table.HeaderCell = require('ember-table/views/header-cell')['default'];
window.Ember.Table.HeaderRow = require('ember-table/views/header-row')['default'];
window.Ember.Table.HeaderTableContainer = require('ember-table/views/header-table-container')['default'];
window.Ember.LazyContainerView = require('ember-table/views/lazy-container')['default'];
window.Ember.LazyItemView = require('ember-table/views/lazy-item')['default'];
window.Ember.Table.LazyTableBlock = require('ember-table/views/lazy-table-block')['default'];
window.Ember.MultiItemViewCollectionView = require('ember-table/views/multi-item-collection')['default'];
window.Ember.Table.ScrollContainer = require('ember-table/views/scroll-container')['default'];
window.Ember.Table.ScrollPanel = require('ember-table/views/scroll-panel')['default'];
window.Ember.Table.TableBlock = require('ember-table/views/table-block')['default'];
window.Ember.Table.TableCell = require('ember-table/views/table-cell')['default'];
window.Ember.Table.TableContainer = require('ember-table/views/table-container')['default'];
window.Ember.Table.TableRow = require('ember-table/views/table-row')['default'];
Ember.onLoad('Ember.Application', function(Application) {
Application.initializer({
name: 'ember-table',
initialize: function(container) {
container.register('component:ember-table', require('ember-table/components/ember-table')['default']);
container.register('view:body-table-container', require('ember-table/views/body-table-container')['default']);
container.register('view:column-sortable-indicator', require('ember-table/views/column-sortable-indicator')['default']);
container.register('view:footer-table-container', require('ember-table/views/footer-table-container')['default']);
container.register('view:header-block', require('ember-table/views/header-block')['default']);
container.register('view:header-cell', require('ember-table/views/header-cell')['default']);
container.register('view:header-row', require('ember-table/views/header-row')['default']);
container.register('view:header-table-container', require('ember-table/views/header-table-container')['default']);
container.register('view:lazy-container', require('ember-table/views/lazy-container')['default']);
container.register('view:lazy-item', require('ember-table/views/lazy-item')['default']);
container.register('view:lazy-table-block', require('ember-table/views/lazy-table-block')['default']);
container.register('view:multi-item-collection', require('ember-table/views/multi-item-collection')['default']);
container.register('view:scroll-container', require('ember-table/views/scroll-container')['default']);
container.register('view:scroll-panel', require('ember-table/views/scroll-panel')['default']);
container.register('view:table-block', require('ember-table/views/table-block')['default']);
container.register('view:table-cell', require('ember-table/views/table-cell')['default']);
container.register('view:table-container', require('ember-table/views/table-container')['default']);
container.register('view:table-row', require('ember-table/views/table-row')['default']);
}
});
});
Ember.Table.EmberTableComponent.reopen({
layoutName: 'components/ember-table'
});
Ember.Handlebars.helper('table-component', Ember.Table.EmberTableComponent);})();