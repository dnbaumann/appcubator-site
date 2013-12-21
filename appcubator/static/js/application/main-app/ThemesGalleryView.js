define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('util');
    var ThemeDisplayView = require('app/ThemeDisplayView');


    var ThemesGalleryView = Backbone.View.extend({
        css: 'gallery',
        events: {
            'mouseover  .theme': 'previewTheme',
            'mouseleave .theme': 'revertTheme',
            'click .load-theme-btn': 'loadTheme'
        },

        className: 'gallery-view',

        initialize: function() {
            this.title = "Themes";
        },

        render: function() {
            this.listView = document.createElement('ul');
            this.listView.className = 'theme-gallery';

            var template = [
                '<li class="theme" class="theme-item" id="theme-<%= id %>">',
                '<h2><%= name %></h2>',
                '<p class="designed-by">Designed by <%= designer %></p>',
                '<div class="img"><img src="<%= image %>"></div>',
                '<div id="theme-btn-<%= id %>" class="btn load-theme-btn">Load Theme</div>',
                '</li>'
            ].join('\n');

            _(themes).each(function(theme, index) {
                if (!theme.name) {
                    theme.name = "Theme " + index;
                }
                this.listView.innerHTML += _.template(template, theme);
            }, this);

            $(this.el).append(this.listView);

            return this;
        },

        previewTheme: function(e) {
            var themeId = String(e.currentTarget.id).replace('theme-','');
            var url = "/theme/" + themeId + '/sheet.css';
            v1.view.iframeProxy.addTempStyleSheet(url);
        },

        revertTheme: function() {

        },

        loadTheme: function(e) {
            var themeId = e.currentTarget.id.replace('theme-btn-','');
           
            $.ajax({
                type: "POST",
                url: '/theme/' + themeId + '/info/',
                success: function(data) {
                    var info = data.themeInfo;
                    var url = '/app/' + appId + '/uiestate/';
                    var newState = uieState;
                    newState = _.extend(uieState, this.theme);

                    var self = this;
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: {
                            uie_state: JSON.stringify(newState)
                        },
                        success: function(data) {
                            //self.$el.find('.load').append('<div class="hoff1"><h4 class="text-success"><strong>Loaded!</strong></h4></div>');
                        }
                    });

                    /* Load Statics */
                    $.ajax({
                        type: "GET",
                        url: '/theme/' + info.id + '/static/',
                        success: function(data) {
                            _(data).each(function(static_file) {
                                $.ajax({
                                    type: "POST",
                                    url: '/app/' + appId + '/static/',
                                    data: JSON.stringify(static_file),
                                    success: function(data) {}
                                });
                            });
                        }
                    });
                },
                dataType: "JSON"
            });

                
        }

    });

    return ThemesGalleryView;
});