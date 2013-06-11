define([
  'models/PageModel',
  'collections/PageCollection',
  'app/UrlView',
  'app/PageView',
  'mixins/ErrorDialogueView',
  'mixins/BackboneNameBox'
],
function(PageModel, PageCollection, UrlView, PageView, ErrorDialogueView) {

  var PagesView = Backbone.View.extend({
    el: document.body,

    initialize: function() {
      _.bindAll(this, 'render',
                      'renderAddMobile',
                      'renderAddWeb',
                      'createPage',
                      'createMobilePage',
                      'appendPage');

      var self = this;
      this.collection = v1State.get('pages');
      this.collection.bind('add', function(model) { self.appendPage(model, false); });

      this.mobileCollection = v1State.get('mobilePages');
      this.mobileCollection.bind('add', function(model) { self.appendPage(model, true); });

      this.title = "Pages";
    },

    render: function() {
      var self = this;

      self.$el.html(_.template(iui.getHTML('pages-page'), {}));
      this.listView = document.getElementById('list-pages');
      this.mobileListView = document.getElementById('list-mobile-pages');

      if(this.collection.length === 0) {
        //$("#web-section").hide();
        //this.renderAddWeb();
      }
      else {
        this.collection.each(function(model) {
          self.appendPage(model, false);
        });
      }

      if(this.mobileCollection.length === 0) {
        //$("#mobile-section").hide();
        //this.renderAddMobile();
      }
      else {
        this.mobileCollection.each(function(model) {
          self.appendPage(model, true);
        });
      }

      var createBox = new Backbone.NameBox({el: document.getElementById('create-page-box')});
      createBox.on('submit', this.createPage);

      var createMobileBox = new Backbone.NameBox({el: document.getElementById('create-mobile-page-box')});
      createMobileBox.on('submit', this.createMobilePage);
    },

    renderAddMobile: function() {
      //this.$el.append('<div class="add-mobile-section pane span40 offset10 hi6"><span class="mw mobile-image"></span><span>Add Mobile Functionality</span></div>');
    },

    renderAddWeb: function() {
      //this.$el.append('<div class="add-web-section pane span40 offset10 hi6"><span class="mw web-image"></span><span>Add Web Functionality</span></div>');
    },

    createPage: function(name, b) {
      var pageUrlPart = name.replace(' ', '_');
      var pageUrl = { urlparts : [pageUrlPart] };

      if(!v1State.get('pages').isUnique(name)) {
        new ErrorDialogueView({text: 'Page name should be unique.'});
        return;
      }
      this.collection.add({ name: name, url: pageUrl});
      v1.save();
    },

    createMobilePage: function(name, b) {
      var pageUrlPart = name.replace(' ', '_');
      var pageUrl = { urlparts : [pageUrlPart] };

      if(!v1State.get('mobilePages').isUnique(name)) {
        new ErrorDialogueView({text: 'Page name should be unique.'});
        return;
      }
      this.mobileCollection.add({ name: name, url: pageUrl});
      v1.save();
    },

    appendPage: function(model, isMobile) {
      if(!isMobile) {
        var ind = _.indexOf(this.collection.models, model);
        var pageView = new PageView(model, ind, false);
        this.listView.appendChild(pageView.el);
      }
      else {
        var ind = _.indexOf(this.mobileCollection.models, model);
        var mobilePageView = new PageView(model, ind, true);
        this.mobileListView.appendChild(mobilePageView.el);
      }
    }

  });

  return PagesView;
});
