define(function(require, exports, module) {

    'use strict';

    var PageModel = require('models/PageModel');
    require('mixins/BackboneNameBox');

    var ToolBarView = Backbone.View.extend({
        subviews: [],

        events: {
            'mouseover #menu-pages': 'expandPages',
            'mouseout #menu-pages': 'shrinkPages',
            'click .go-to-page': 'clickedGoToPage',
            'click a.back': 'navigateBack',
            'mouseover .dropdown-arrow': 'expandPages',
            'mouseout .dropdown-arrow': 'shrinkPages'
        },

        initialize: function(navbarModel) {
            _.bindAll(this);

            this.nmrFields = v1State.get('pages').length + 1;
            if (this.nmrFields > 6) this.nmrFields = 6;
            this.listenTo(v1State.get('pages'), 'add remove', function() {
                this.nmrFields = v1State.get('pages').length + 1;
                if (this.nmrFields > 6) this.nmrFields = 6;
            }, this);

        },

        render: function() {
            util.get('current-page').innerHTML = v1State.get('pages').models[pageId].get('name');
            this.pageList = util.get('page-list');

            v1State.get('pages').each(function(page, ind) {
                if (pageId == ind) return;
                this.renderPageItem(ind, page.get('name'));
            }, this);

            this.createBox = new Backbone.NameBox({
                txt: 'New Page'
            }).render();
            this.createBox.on('submit', this.createPage);

            util.get('create-page').appendChild(this.createBox.el);

            this.menuPages = document.getElementById('menu-pages');
            return this;
        },

        renderPageItem: function(ind, name) {
            this.pageList.innerHTML += '<li class="go-to-page" id="page-' + ind + '"><a>' + name + '</a></li>';
        },

        clickedGoToPage: function(e) {
            var goToPageId = (e.target.id || e.target.parentNode.id).replace('page-', '');
            v1.navigate("app/" + appId + "/page/" + goToPageId + "/", {
                trigger: true
            });
        },

        createPage: function(name) {
            var pageInd = v1State.get('pages').length;
            var pageModel = new PageModel({
                name: name
            });
            pageModel.setupUrl(name);
            v1State.get('pages').push(pageModel);

            var self = this;
            v1.save(null, function() {
                $('#page-list').append('<li class="go-to-page" id="page-' + pageInd + '"><a>' + name + '</a></li>');
                self.expandPages();
                util.scrollToBottom($('#page-list'));
            });
        },

        expandPages: function() {
            $('#menu-pages').height((this.nmrFields) * 42);
        },

        shrinkPages: function(e) {
            if (util.isMouseOn(e.pageX, e.pageY, this.menuPages)) return;
            $('#menu-pages').height(42);
            this.createBox.reset();
        },

        navigateBack: function() {
            window.history.back();
        }

    });

    return ToolBarView;
});