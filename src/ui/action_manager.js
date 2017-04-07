/**
 * Action object contains
 * @param options.which Array of key codes
 * @param options.shift Whether shift key is required
 * @param options.commandKey Whether command key is required
 * @param options.name Shortcut name
 * @param options.cb Function callback
 * @param options.accept Additional function to test whether to accept shortcut
 * @param options.icon Optional icon to display
 */
morpheus.ActionManager = function () {
  this.actionNameToAction = new morpheus.Map();
  this.actions = [];
  // TODO selection-invert, all, clear, all, move to top, copy
  // pin/unpin tab,
  // header stuff-display, etc.
  var activeElement;
  this.add({
    name: 'Sort',
    cb: function (options) {
      new morpheus.SortDialog(options.heatMap.getProject());
    },
    icon: 'fa fa-sort-alpha-asc',
  });

  var $filterModal = null;
  this.add({
    name: 'Filter',
    cb: function (options) {
      if ($filterModal == null) {
        var filterModal = [];
        var filterLabelId = _.uniqueId('morpheus');
        filterModal
        .push('<div class="modal" tabindex="1" role="dialog" aria-labelledby="'
          + filterLabelId + '">');
        filterModal.push('<div class="modal-dialog" role="document">');
        filterModal.push('<div class="modal-content">');
        filterModal.push('<div class="modal-header">');
        filterModal
        .push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        filterModal.push('<h4 class="modal-title" id="' + filterLabelId
          + '">Filter</h4>');
        filterModal.push('</div>');
        filterModal.push('<div class="modal-body"></div>');
        filterModal.push('<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>');
        filterModal.push('</div>');
        filterModal.push('</div>');
        filterModal.push('</div>');
        $filterModal = $(filterModal.join(''));
        $filterModal.on('mousewheel', function (e) {
          e.stopPropagation();
        });
        var $filter = $('<div style="padding-bottom:30px;"></div>');
        $filter.appendTo($filterModal.find('.modal-body'));
        var filterHtml = [];
        filterHtml
        .push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="rows" checked>Rows</label></div> ');
        filterHtml
        .push('<div class="radio"><label><input type="radio" name="rowsOrColumns" value="columns">Columns</label></div>');

        var $filterChooser = $(filterHtml.join(''));
        $filterChooser.appendTo($filter);
        var columnFilterUI = new morpheus.FilterUI(options.heatMap.getProject(), true);
        var rowFilterUI = new morpheus.FilterUI(options.heatMap.getProject(), false);
        // options.heatMap.getProject().getRowFilter().on('focus', function (e) {
        //   $filterChooser.find('[value=rows]').prop('checked', true);
        //   columnFilterUI.$div.hide();
        //   rowFilterUI.$div.show();
        //   $filterModal.modal('show');
        //   morpheus.Util.trackEvent({
        //     eventCategory: '',
        //     eventAction: 'rowFilter'
        //   });
        //
        // });
        // options.heatMap.getProject().getColumnFilter().on('focus', function (e) {
        //   $filterChooser.find('[value=columns]').prop('checked', true);
        //   columnFilterUI.$div.show();
        //   rowFilterUI.$div.hide();
        //   $filterModal.modal('show');
        //   morpheus.Util.trackEvent({
        //     eventCategory: '',
        //     eventAction: 'columnFilter'
        //   });
        // });
        rowFilterUI.$div.appendTo($filter);
        columnFilterUI.$div.appendTo($filter);
        columnFilterUI.$div.css('display', 'none');
        var $filterRadio = $filterChooser.find('[name=rowsOrColumns]');
        $filterRadio.on('change', function (e) {
          var val = $filterRadio.filter(':checked').val();
          if (val === 'columns') {
            columnFilterUI.$div.show();
            rowFilterUI.$div.hide();
          } else {
            columnFilterUI.$div.hide();
            rowFilterUI.$div.show();
          }
          e.preventDefault();
        });
        $filterModal.appendTo(options.heatMap.$content);
        $filterModal.on('hidden.bs.modal', function () {
          $(activeElement).focus();
        });
      }
      activeElement = document.activeElement;
      $filterModal.modal('show');
    },
    icon: 'fa fa-filter',
  });

  this.add({
    name: 'Options',
    cb: function (options) {
      options.heatMap.showOptions();
    },
    icon: 'fa fa-cog',
  });

  this.add({
    which: [191], // slash
    commandKey: true,
    global: true,
    name: 'Toggle Search',
    cb: function (options) {
      options.heatMap.getToolbar().toggleSearch();
    }
  });

  //
  this.add({
    name: 'Copy Image',
    icon: 'fa fa-clipboard',
    cb: function (options) {
      var bounds = options.heatMap.getTotalSize();
      var height = bounds.height;
      var width = bounds.width;
      var canvas = $('<canvas></canvas>')[0];
      var backingScale = morpheus.CanvasUtil.BACKING_SCALE;
      canvas.height = backingScale * height;
      canvas.style.height = height + 'px';
      canvas.width = backingScale * width;
      canvas.style.width = width + 'px';
      var context = canvas.getContext('2d');
      morpheus.CanvasUtil.resetTransform(context);
      options.heatMap.snapshot(context);
      var url = canvas.toDataURL();
      // canvas.toBlob(function (blob) {
      // 	url = URL.createObjectURL(blob);
      // 	event.clipboardData
      // 	.setData(
      // 		'text/html',
      // 		'<img src="' + url + '">');
      // });
      setTimeout(function () {
        morpheus.Util.setClipboardData('<img src="' + url + '">');
      }, 20);

    }
  });

  //
  this.add({
    name: 'Close Tab',
    cb: function (options) {
      options.heatMap.getTabManager().remove(options.heatMap.tabId);
    }
  });
  this.add({
    name: 'Rename Tab',
    cb: function (options) {
      options.heatMap.getTabManager().rename(options.heatMap.tabId);
    }
  });

  this.add({
    which: [88], // x
    commandKey: true,
    name: 'New Heat Map',
    accept: function (options) {
      return (!options.isInputField || window.getSelection().toString() === '');
    },

    cb: function (options) {
      morpheus.HeatMap.showTool(new morpheus.NewHeatMapTool(),
        options.heatMap);
    }
  });

  this.add({
    which: [67], // C
    commandKey: true,
    name: 'Copy'
  });

  this.add({
    which: [86], // V
    commandKey: true,
    name: 'Paste Dataset'
  });

  this.add({
    global: true,
    name: 'Open File',
    cb: function (options) {
      morpheus.HeatMap.showTool(new morpheus.OpenFileTool({
        customUrls: options.heatMap._customUrls
      }), options.heatMap);
    },
    which: [79],
    commandKey: true,
    icon: 'fa fa-folder-open-o'
  });

  this.add({
    name: 'Save Image',
    gui: function () {
      return new morpheus.SaveImageTool();
    },
    cb: function (options) {
      morpheus.HeatMap.showTool(this.gui(),
        options.heatMap);
    },
    which: [83],
    commandKey: true,
    global: true,
    icon: 'fa fa-file-image-o'
  });

  this.add({
    name: 'Save Dataset',
    gui: function () {
      return new morpheus.SaveDatasetTool();
    },
    cb: function (options) {
      morpheus.HeatMap.showTool(this.gui(),
        options.heatMap);
    },
    shiftKey: true,
    which: [83],
    commandKey: true,
    global: true,
    icon: 'fa fa-floppy-o'
  });

  this.add({
    name: 'Save Session',
    gui: function () {
      return new morpheus.SaveSessionTool();
    },
    cb: function (options) {
      morpheus.HeatMap.showTool(this.gui(), options.heatMap);
    },
    icon: 'fa fa-anchor'
  });

  if (typeof Plotly !== 'undefined') {
    this.add({
      name: 'Chart',
      cb: function (options) {
        new morpheus.ChartTool({
          project: options.heatMap.getProject(),
          getVisibleTrackNames: _.bind(
            options.heatMap.getVisibleTrackNames, options.heatMap)
        });
      },
      icon: 'fa fa-line-chart'
    });
  }

  this.add({
    name: 'Zoom In',
    cb: function (options) {
      options.heatMap.zoom(true);
    },
    which: [107, 61, 187],
    icon: 'fa fa-plus'
  });
  this.add({
    name: 'Zoom Out',
    cb: function (options) {
      options.heatMap.zoom(false);
    },
    which: [173, 189, 109],
    icon: 'fa fa-minus'
  });

  this.add({
    name: 'Fit To Window',
    cb: function (options) {
      options.heatMap.fitToWindow(true);
    },
    icon: 'fa fa-compress'
  });
  this.add({
    name: 'Reset Zoom',
    cb: function (options) {
      options.heatMap.resetZoom();
    },
    button: '100%'
  });

  this.add({
    which: [35],
    name: 'Go To End',
    cb: function (options) {
      options.heatMap.scrollLeft(options.heatMap.heatmap.getPreferredSize().width);
      options.heatMap.scrollTop(options.heatMap.heatmap.getPreferredSize().height);
    }
  });
  this.add({
    which: [36], // home key
    name: 'Go To Start',
    cb: function (options) {
      options.heatMap.scrollLeft(0);
      options.heatMap.scrollTop(0);
    }
  });
  this.add({
    which: [34], // page down
    commandKey: true,
    name: 'Go To Bottom',
    cb: function (options) {
      options.heatMap
      .scrollTop(options.heatMap.heatmap.getPreferredSize().height);
    }
  });
  this.add({
    which: [34], // page down
    commandKey: false,
    name: 'Scroll Page Down',
    cb: function (options) {
      var pos = options.heatMap.scrollTop();
      options.heatMap.scrollTop(pos + options.heatMap.heatmap.getUnscaledHeight()
        - 2);
    }
  });

  this.add({
    which: [33], // page up
    commandKey: true,
    name: 'Go To Top',
    cb: function (options) {
      options.heatMap
      .scrollTop(0);
    }
  });
  this.add({
    which: [33], // page up
    commandKey: false,
    name: 'Scroll Page Up',
    cb: function (options) {
      var pos = options.heatMap.scrollTop();
      options.heatMap.scrollTop(pos - options.heatMap.heatmap.getUnscaledHeight()
        + 2);
    }
  });

  this.add({
    which: [38], // up arrow
    commandKey: true,
    name: 'Zoom Out Rows',
    cb: function (options) {
      options.heatMap.zoom(false, {
        columns: false,
        rows: true
      });
    }
  });
  this.add({
    which: [38], // up arrow
    commandKey: false,
    name: 'Scroll Up',
    cb: function (options) {
      options.heatMap.scrollTop(options.heatMap.scrollTop() - 8);
    }
  });

  this.add({
    which: [40], // down arrow
    commandKey: true,
    name: 'Zoom In Rows',
    cb: function (options) {
      options.heatMap.zoom(true, {
        columns: false,
        rows: true
      });
    }
  });
  this.add({
    which: [40], // down arrow
    commandKey: false,
    name: 'Scroll Down',
    cb: function (options) {
      options.heatMap.scrollTop(options.heatMap.scrollTop() + 8);
    }
  });

  this.add({
    which: [37], // left arrow
    commandKey: true,
    name: 'Zoom Out Columns',
    cb: function (options) {
      options.heatMap.zoom(false, {
        columns: true,
        rows: false
      });
    }
  });
  this.add({
    which: [37], // left arrow
    commandKey: false,
    name: 'Scroll Left',
    cb: function (options) {
      options.heatMap.scrollLeft(options.heatMap.scrollLeft() - 8);
    }
  });

  this.add({
    which: [39], // right arrow
    commandKey: true,
    name: 'Zoom In Columns',
    cb: function (options) {
      options.heatMap.zoom(true, {
        columns: true,
        rows: false
      });
    }
  });
  this.add({
    which: [39], // right arrow
    commandKey: false,
    name: 'Scroll Right',
    cb: function (options) {
      options.heatMap.scrollLeft(options.heatMap.scrollLeft() + 8);
    }
  });
  this.add({
    name: 'Tutorial',
    cb: function () {
      window
      .open('https://clue.io/morpheus/tutorial.html');
    }
  });
  this.add({
    icon: 'fa fa-code',
    name: 'Source Code',
    cb: function () {
      window.open('https://github.com/cmap/morpheus.js');
    }
  });
  var $findModal;
  var $search;

  this.add({
    which: [65],
    shiftKey: true,
    commandKey: true,
    name: 'Find Action',
    cb: function (options) {
      if ($findModal == null) {
        var findModal = [];
        var id = _.uniqueId('morpheus');
        findModal
        .push('<div class="modal" tabindex="1" role="dialog" aria-labelledby="'
          + id + '">');
        findModal.push('<div class="modal-dialog" role="document">');
        findModal.push('<div class="modal-content">');
        findModal.push('<div class="modal-header">');
        findModal
        .push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        findModal.push('<h4 class="modal-title" id="' + id
          + '">Enter action</h4>');
        findModal.push('</div>');
        findModal.push('<div class="modal-body ui-front"><input class="form-control input-sm"' +
          ' autofocus></div>');
        findModal.push('</div>');
        findModal.push('</div>');
        findModal.push('</div>');
        $findModal = $(findModal.join(''));
        $findModal.appendTo(options.heatMap.$content);
        var allActions = options.heatMap.getActionManager().getActions();
        $search = $findModal.find('input');
        $search.on('keyup', function (e) {
          if (e.which === 13) {
            var text = $search.val().trim();
            if (text !== '') {
              var action = _this.getAction(text);
              if (action) {
                $findModal.modal('hide');
                _this.execute(text, {event: e});
              }
            }
          }
        });
        morpheus.Util.autosuggest({
          $el: $search,
          multi: false,
          suggestWhenEmpty: false,
          //  history: options.history,
          filter: function (tokens, response) {
            var token = tokens[0].trim();
            var matches = [];
            var replaceRegex = new RegExp('(' + morpheus.Util.escapeRegex(token) + ')', 'i');
            for (var i = 0; i < allActions.length; i++) {
              if (allActions[i].cb) {
                var name = allActions[i].name;
                if (replaceRegex.test(name)) {
                  matches.push({
                    clear: true,
                    value: name,
                    label: '<span style="margin-left: 10px">'
                    + name.replace(replaceRegex, '<b>$1</b>') + '</span>'
                  });
                }
              }
            }
            response(matches);

          },
          select: function () {
            setTimeout(function () {
              var text = $search.val().trim();
              if (text !== '') {
                var action = _this.getAction(text);
                if (action) {
                  $findModal.modal('hide');
                  _this.execute(text);
                }
              }
            }, 20);

          }
        });
        $findModal.on('hidden.bs.modal', function () {
          $(activeElement).focus();
        });
      }
      activeElement = document.activeElement;
      $findModal.modal('show');
      $search.focus();
    }
  });
  this.add({
    name: 'Keymap Reference',
    cb: function () {
      new morpheus.HeatMapKeyListener({
        $tabPanel: $()
      }).showKeyMapReference();
    }
  });

  this.add({
    name: 'Linking',
    cb: function () {
      window
      .open('https://clue.io/morpheus/linking.html');
    }
  });
  this.add({
    name: 'Contact',
    icon: 'fa fa-envelope-o',
    cb: function () {
      morpheus.FormBuilder.showInModal({
        title: 'Contact',
        html: 'Please email us at morpheus@broadinstitute.org'
      });
    }
  });

  this.add({
    which: [65], // a
    commandKey: true,
    name: 'Select All',
    accept: function (options) {
      var active = options.heatMap.getActiveComponent();
      return (active === 'rowTrack' || active === 'columnTrack');
    },
    cb: function (options) {
      var active = options.heatMap.getActiveComponent();
      var selectionModel = active === 'rowTrack' ? options.heatMap.getProject()
      .getRowSelectionModel() : options.heatMap.getProject()
      .getColumnSelectionModel();
      var count = active === 'rowTrack' ? options.heatMap.getProject()
      .getSortedFilteredDataset().getRowCount() : options.heatMap
      .getProject().getSortedFilteredDataset()
      .getColumnCount();
      var indices = new morpheus.Set();
      for (var i = 0; i < count; i++) {
        indices.add(i);
      }
      selectionModel.setViewIndices(indices, true);
    }
  });

  var _this = this;
  [new morpheus.HClusterTool(), new morpheus.MarkerSelection(), new morpheus.NearestNeighbors(), new morpheus.AdjustDataTool(), new morpheus.CollapseDatasetTool(), new morpheus.CreateAnnotation(), new morpheus.SimilarityMatrixTool(), new morpheus.TransposeTool(), new morpheus.TsneTool(), new morpheus.DevAPI()].forEach(function (tool) {
    _this.add({
      name: tool.toString(),
      gui: function () {
        return tool;
      },
      cb: function (options) {
        morpheus.HeatMap.showTool(tool, options.heatMap);
      }
    });
  });

};
morpheus.ActionManager.prototype = {
  getActions: function () {
    return this.actions;
  },
  getAction: function (name) {
    return this.actionNameToAction.get(name);
  },
  execute: function (name, args) {
    var action = this.getAction(name);
    if (args == null) {
      args = {};
    }

    args.heatMap = this.heatMap;
    action.cb(args);
    morpheus.Util.trackEvent({
      eventCategory: '',
      eventAction: name
    });
  },
  add: function (action) {
    this.actions.push(action);
    this.actionNameToAction.set(action.name, action);
  }
};