/**
* Pager Control
*/

/* start-amd-strip-block */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {
/* end-amd-strip-block */

  $.fn.pager = function(options) {

    // Settings and Options
    var pluginName = 'pager',
        defaults = {
          type: 'list', //Differet types of pagers: list, table and more
          position: 'bottom',  //Can be on top as well.
          activePage: 1, //Start on this page
          source: null,  //Call Back Function for Pager Data Source
          pagesize: 15, //Can be calculate or a specific number
          pagesizes: [15, 25, 50, 75],
          indeterminate: false // Will not show anything that lets you go to a specific page
        },
        settings = $.extend({}, defaults, options);

    // Plugin Constructor
    function Pager(element) {
      this.settings = $.extend({}, settings);
      this.element = $(element);
      this.init();
    }

    // Actual Plugin Code
    Pager.prototype = {

      init: function() {
        //this.activePage = this.settings.activePage;
        this.setup();
        this.buttonExpr = 'li:not(.pager-prev):not(.pager-next):not(.pager-first):not(.pager-last)';
        this.createPagerBar();
        this.setActivePage(this.settings.activePage); //Get First Page
        this.renderBar();
        this.renderPages(false, 'initial');
        this.handleEvents();
      },

      setup: function() {
        // Adjust for the possibility of the pager being attached to a Table instead of normal grid markup
        if (this.element.is('tbody')) {
          this.isTable = true;
          this.settings.type = 'table';
          this.mainContainer = this.element.closest('.datagrid-wrapper');
        }

        // If contained by a widget/card container, build some settings for that
        var widgetContainer = this.element.closest('.card, .widget');
        if (widgetContainer.length) {
          this.isList = true;
          this.settings.type = 'list';
          this.mainContainer = widgetContainer;
        }

        return this;
      },

      createPagerBar: function () {
        this.pagerBar = this.element.prev('.pager-toolbar');

        if (this.pagerBar.length === 0) {
          this.pagerBar = $('<ul class="pager-toolbar"></ul>');
          var buttons = '<li class="pager-prev">' +
              '<a href="#" rel="prev" title="PreviousPage">' +
                '<svg class="icon" focusable="false" aria-hidden="true" role="presentation">' +
                  '<use xlink:href="#icon-previous-page"></use>' +
                '</svg>' +
                '<span class="audible">Previous</span>' +
              '</a>' +
            '</li>' +
            '<li class="pager-next">' +
              '<a href="#" rel="next" title="NextPage">' +
                '<svg class="icon" focusable="false" role="presentation" aria-hidden="true">' +
                  '<use xlink:href="#icon-next-page"></use>' +
                '</svg>' +
                '<span class="audible">Next</span> ' +
              '</a>' +
            '</li>';

          if (this.settings.type === 'table') {
            buttons = '<li class="pager-first">' +
              '<a href="#" title="FirstPage">' +
                '<svg class="icon" focusable="false" role="presentation" aria-hidden="true">' +
                  '<use xlink:href="#icon-first-page"></use>' +
                '</svg>' +
                '<span class="audible">First</span>' +
              '</a>' +
            '</li>' +
            buttons +
            '<li class="pager-last">' +
              '<a href="#" title="LastPage">' +
                '<svg class="icon" focusable="false" role="presentation" aria-hidden="true">' +
                  '<use xlink:href="#icon-last-page"></use>' +
                '</svg>' +
                '<span class="audible">Last</span>' +
              '</a>' +
            '</li>';
          }

          this.pagerBar.html(buttons);
        }

        if (this.isTable) {
          this.mainContainer.after(this.pagerBar);
        } else {
          if (this.settings.position ==='bottom') {
            this.element.after(this.pagerBar);
          } else {
            this.element.before(this.pagerBar);
          }
        }

        // Inside of Listviews, place the pager bar inside of the card/widget footer
        if (this.settings.type === 'list') {
          var self = this,
            widgetTypes = ['widget', 'card'];

          widgetTypes.forEach(function(type) {
            var widgetContent = self.element.closest('.' + type + '-content');
            if (!widgetContent.length) {
              return;
            }

            var widgetFooter = widgetContent.next('.' + type + '-footer');
            if (!widgetFooter.length) {
              widgetFooter = $('<div class="'+ type +'-footer"></div>').insertAfter(widgetContent);
            }

            self.pagerBar.appendTo(widgetFooter);
          });
        }

        this.pagerBar.find('a').tooltip();
      },

      // Attach All relevant events
      handleEvents: function () {
        var self = this;

        //Adjust buttons on resize
        $(window).on('resize.pager', function () {
          self.renderBar();
        });

        //Attach button click and touch
        this.pagerBar.onTouchClick('pager', 'a').on('click.pager', 'a', function (e) {
          var li = $(this).parent();
          e.preventDefault();

          if (li.is('.pager-prev')) {
            self.setActivePage(self.activePage - 1, false, 'prev');
            return false;
          }

          if (li.is('.pager-next')) {
            self.setActivePage(self.activePage + 1, false, 'next');
            return false;
          }

          if (li.is('.pager-first')) {
            self.setActivePage(1, false, 'first');
            return false;
          }

         if (li.is('.pager-last')) {
            self.setActivePage(self.pageCount(), false, 'last');  //TODO Calculate Last Page?
            return false;
          }

          //Go to the page via the index of the button
          self.setActivePage($(this).parent().index() + (self.settings.type === 'table' ? -1 : 0), false, 'page');

          return false;
        });

        //Toolbar functionality
        this.pagerBar.find('a').on('keydown.pager', function (e) {
          e = (e) ? e : window.event;
          var charCode = (e.which) ? e.which : ((e.keyCode) ? e.keyCode : false),
            btn = (charCode === 37) ? $('a', $(this).parent().prev()) : (charCode === 39) ? $('a', $(this).parent().next()) : false;

          if (!!btn) {
            if(!btn.attr('disabled')) {
              btn.focus();
            }
          }
        });
      },

      //Set or Get Current Page
      setActivePage: function(pageNum, force, op) {
        var lis = this.pagerBar.find(this.buttonExpr);

        // Check to make sure our internal active page is set
        if (!this.activePage || isNaN(this.activePage)) {
          this.activePage = this.settings.activePage;
        }

        if (pageNum === 0 || pageNum > this.pageCount()) {
          return this.activePage;
        }

        if (pageNum === undefined) {
          return this.activePage;
        }

        if (pageNum === this.activePage && !force) {
          return this.activePage;
        }

        this.activePage = pageNum;

        //Remove selected
        if (!this.settings.source) {
          lis.filter('.selected').removeClass('selected').removeAttr('aria-selected')
            .find('a').removeAttr('aria-disabled')
              .find('.audible').html(Locale.translate('Page'));

          //Set selected Page
          lis.eq(pageNum-1).addClass('selected').attr('aria-selected', true)
            .find('a').attr('aria-disabled', true)
              .find('.audible').html(Locale.translate('PageOn'));
        }

        this.renderBar();
        this.renderPages(false, op);
        return pageNum;
      },

      _pageCount: 0,

      //Get/Set Total Number of pages
      pageCount: function(pages) {
        var self = this;

        if (!pages && !this.settings.source) {
          return this._pageCount;
        }

        if (pages) {
          this._pageCount = pages;
        }

        //Add in fake pages
        if (!this.isTable) {
          this.pagerBar.find(this.buttonExpr).remove();
        }

        var i, thisClass, thisText, isAriaSelected, isAriaDisabled;

        for (i = pages; i > 0; i--) {
          if (i === 1) {
            thisClass = 'class="selected"';
            thisText = Locale.translate('PageOn');
            isAriaSelected = 'aria-selected="true"';
            isAriaDisabled = 'aria-disabled="true"';
          } else {
            thisClass = '';
            thisText = Locale.translate('Page');
            isAriaSelected = '';
            isAriaDisabled = '';
          }

          if (!this.isTable) {
            $('<li '+ thisClass + isAriaSelected +'><a '+ isAriaDisabled +'><span class="audible">'+ thisText +' </span>'+ i +'</a></li>').insertAfter(this.pagerBar.find('.pager-prev'));
          }
        }

        if (this.isTable && !this.settings.indeterminate && this.pagerBar.find('.pager-count').length === 0) {
          var text =  Locale.translate('PageOf');
          text = text = text.replace('{0}', '<input data-mask="###" name="pager-pageno" value="' + this.activePage + '">');
          text = text.replace('{1}', '<span class="pager-total-pages">' + (pages ? pages : '-') + '</span>');

          $('<label class="pager-count">'+ text +' </label>').insertAfter(this.pagerBar.find('.pager-prev'));

          //Setup interactivty with the numeric page input
          var lastValue = null;

          this.pagerBar.find('.pager-count input').mask()
          .on('focus', function () {
            lastValue = $(this).val();
          }).on('blur', function () {
            if (lastValue !== $(this).val()) {
              self.setActivePage(parseInt($(this).val()), false, 'page');
            }
          }).on('keydown', function (e) {
            if (e.which === 13) {
              self.setActivePage(parseInt($(this).val()), false, 'page');
            }
          });
        }

        //Add functionality to change page size.
        if (this.isTable && this.pagerBar.find('.btn-menu').length === 0) {
          var pageSize = $('<li class="pager-pagesize"><div class="btn-group"> <button type="button" class="btn-menu"> <span>' + Locale.translate('RecordsPerPage').replace('{0}', this.settings.pagesize) +'</span> <svg class="icon" focusable="false" role="presentation" aria-hidden="true"> <use xlink:href="#icon-dropdown"></use> </svg> </button>  </div></li>');
          $(pageSize).insertAfter(this.pagerBar.find('.pager-last'));
          var menu = $('<ul class="popupmenu has-icons"></ul>');

          for (var k = 0; k < self.settings.pagesizes.length; k++) {
            var size = self.settings.pagesizes[k];
            menu.append('<li '+ (size === self.settings.pagesize ? ' class="is-checked"' : '') +'><a href="#">' + size + '</a></li>');
          }

          pageSize.find('button').after(menu);

          this.pagerBar.find('.btn-menu').popupmenu().on('selected.pager', function (e, args) {
            var tag = args;
            tag.closest('.popupmenu').find('.is-checked').removeClass('is-checked');
            tag.parent('li').addClass('is-checked');
            self.settings.pagesize = parseInt(tag.text());
            self.setActivePage(1, true, 'first');
           });

          $('[href="#25"]').parent().addClass('is-checked');
        }

        return this._pageCount;
      },

      // Reliably gets all the pre-rendered elements in the container and returns them for use.
      getPageableElements: function() {
        var elements = this.element.children();

        // Adjust for cases where the root is a <ul>
        if (elements.is('ul')) {
          elements = elements.children();
        }

        return elements;
      },

      // Render Pages
      renderBar: function() {
        //How many can fit?
        var pb = this.pagerBar,
          elems, pc,
          width = (this.element.parent().width() / pb.find('li:first').width()),
          howMany = Math.floor(width-3);   //Take out the ones that should be visible (buttons and selected)

        //Check Data Attr
        if (this.element.attr('data-pagesize')) {
          this.settings.pagesize = this.element.attr('data-pagesize');
        }

        //Adjust Page count numbers
        if (!this.settings.source) {
          pc = Math.ceil(this.getPageableElements().not('.is-filtered').length/this.settings.pagesize);
          if (this.pageCount() !== pc) {
            this.pageCount(pc);
          }
        }

        //Refresh Disabled
        var prev = pb.find('.pager-prev a'), next = pb.find('.pager-next a'),
          first = pb.find('.pager-first a'), last = pb.find('.pager-last a');

        prev.removeAttr('disabled');
        next.removeAttr('disabled');
        first.removeAttr('disabled');
        last.removeAttr('disabled');

        if (this.activePage === 1) {
          prev.attr('disabled','disabled');
          first.attr('disabled','disabled');
        }

        if (this.activePage === this.pageCount()) {
          next.attr('disabled','disabled');
          last.attr('disabled','disabled');
        }

        //Remove from the front until selected is visible and we have at least howMany showing
        //rowTemplate
        if (!this.settings.source) {
          elems = pb.find(this.buttonExpr);
          elems.show();
          if (elems.length < howMany) {
            return;
          }

          elems.each(function () {
            var li = $(this);
            if (pb.find('.pager-next').offset().top - pb.offset().top > 1 && !li.is('.selected')) {
              $(this).hide();
            }
          });

        }
      },

      pagerInfo: {},

      // Render Paged Items
      renderPages: function(uiOnly, op) {
        var expr,
          self = this,
          request = {
            activePage: self.activePage,
            pagesize: self.settings.pagesize,
            type: op,
            total: -1
          };

        //Make an ajax call and wait
        setTimeout(function () {
          var doPaging = self.element.triggerHandler('beforepaging', request);

          if (doPaging === false) {
            return;
          }

          if (self.settings.source && !uiOnly) {
            var api, response;

            // Distinguish between datagrid and listview
            if (self.isTable) {
              api = self.mainContainer.children('.datagrid-container').data('datagrid');
            } else {
              api = self.element.data('listview');
            }

            response = function(data, pagingInfo) {
              //Render Data
              api.loadData(data, pagingInfo, true);

              //Update Paging Info
              self.updatePagingInfo(pagingInfo);

              setTimeout(function () {
                self.element.trigger('afterpaging', pagingInfo);
              },1);
              return;
            };

            if (api.sortColumn && api.sortColumn.sortId) {
              request.sortAsc = api.sortColumn.sortAsc;
              request.sortField = api.sortColumn.sortField;
              request.sortId = api.sortColumn.sortId;
            }

            if (api.filterExpr) {
               request.filterExpr = api.filterExpr;
            }

            self.settings.source(request, response);
          }

          //Make an ajax call and wait
          self.element.trigger('paging', request);
          var elements = self.getPageableElements(),
            isExpandable = (self.settings.rowTemplate !== undefined);

          //Render page objects
          if (!self.settings.source) {
            var rows = (isExpandable ? self.settings.pagesize * 2 : self.settings.pagesize);
            elements.hide();
            expr = (self.activePage === 1 ? ':not(".is-filtered"):lt('+ rows +')' : ':not(".is-filtered"):lt('+ ((self.activePage) * rows) +'):gt('+ (((self.activePage-1) * rows) -1) +')');
            elements.filter(expr).show();
          } else {
            elements.show();
          }

          if (!self.settings.source) {
            self.element.trigger('afterpaging', request);
            self.updatePagingInfo(request);
          }

        }, 0);
      },

      updatePagingInfo: function(pagingInfo) {
        this.settings.pagesize = pagingInfo.pagesize || this.settings.pagesize;
        this.pagerBar.find('.btn-menu span').text(Locale.translate('RecordsPerPage').replace('{0}', this.settings.pagesize));

        if (this.settings.source) {
          this._pageCount = Math.ceil(pagingInfo.total/this.settings.pagesize);
          this.activePage = pagingInfo.activePage;

          //Set first and last page if passed
          this.setActivePage(this.activePage, false, 'pageinfo');
        }

        //Update the UI
        this.pagerBar.find('.pager-count input').val(this.activePage);

        if (this._pageCount !== '0') {
          this.pagerBar.find('.pager-total-pages').text(this._pageCount);
        }

        if (pagingInfo.firstPage) {
          this.pagerBar.find('.pager-first a').attr('disabled', 'disabled');
          this.pagerBar.find('.pager-prev a').attr('disabled', 'disabled');
        }

        if (pagingInfo.lastPage) {
          this.pagerBar.find('.pager-next a').attr('disabled', 'disabled');
          this.pagerBar.find('.pager-last a').attr('disabled', 'disabled');
        }
      },

      //Teardown
      destroy: function() {
        $.removeData(this.element[0], pluginName);
      }
    };

    // Initialize the plugin (Once)
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        instance = $.data(this, pluginName, new Pager(this, settings));
      }
    });
  };

/* start-amd-strip-block */
}));
/* end-amd-strip-block */
