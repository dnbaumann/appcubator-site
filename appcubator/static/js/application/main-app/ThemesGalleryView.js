define([
  'app/ThemeDisplayView',
  'backbone',
  'util'
],
function(ThemeDisplayView) {

  var ThemesGalleryView = Backbone.View.extend({
    css: 'gallery',
    events: {
      'click .theme' : 'showThemeModal'
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
          '<div class="details">Click to See Details</div>',
        '</li>'
      ].join('\n');

      _(themes).each(function(theme, index) {
        if(!theme.name) {
          theme.name = "Theme " + index;
        }
        this.listView.innerHTML += _.template(template, theme);
      }, this);

      $(this.el).append(this.listView);

      return this;
    },

    showThemeModal: function(e) {
      var themeId = e.target.parentNode.id.replace('theme-','');
      $.ajax({
        type: "POST",
        url: '/theme/'+themeId+'/info/',
        success: function(data) {
          new ThemeDisplayView(data, themeId);
        },
        dataType: "JSON"
      });
    }

  });

  return ThemesGalleryView;
});
