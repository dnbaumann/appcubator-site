define([
  'util'
],
function() {

  var ColumnView = Backbone.View.extend({
    className : 'column-view',
    width: 12,
 
    events: {
      'click' : 'splitColumn'
    },

    initialize: function(columnM) {
      _.bindAll(this);
      this.model = columnM;
      this.listenTo(this.model, 'change:width', this.layout);
    },

    render: function() {
      this.el.className += (' span'+this.model.getWidth());
      return this;
    },

    layout: function() {
      console.log('layout');
      this.el.className = (this.className + ' span'+this.model.getWidth());
    },

    splitColumn: function() {
      this.model.split();
    }

  });

  return ColumnView;
});
