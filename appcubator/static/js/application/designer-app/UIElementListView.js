define([
  'designer-app/UIElementView',
  'models/UIElementModel',
  'util',
  'designer-app/base-tags',
  'designer-app/ThemeTemplates'
],
function(UIElementView, UIElementModel) {

  var UIElementListView = Backbone.View.extend({
    className: 'list',
    events : {
      'click div.create-text'       : 'showForm',
      'submit .element-create-form' : 'submitForm'
    },

    initialize: function(UIElementColl, type) {
      _.bindAll(this,'render',
                     'showForm',
                     'submitForm',
                     'appendUIE',
                     'removeUIE');

      this.type = type;
      this.collection = UIElementColl;
      this.collection.bind('add', this.appendUIE);
      this.collection.bind('remove', this.removeUIE);
      this.render();
    },

    render: function() {
      var self = this;
      var div = document.createElement('span');
      div.className = 'elems';
      this.elems = div;
      this.el.appendChild(this.elems);

      this.collection.each(function(uieModel) {
        uieModel.id = self.collection.length;
        self.appendUIE(uieModel);
      });

      var createBtn = document.createElement('span');
      createBtn.innerHTML = _.template(ThemeTemplates.tempCreate, {});

      this.el.appendChild(createBtn);
      return this;
    },


    showForm: function(e) {
      var root = {};
      if(baseTags[this.type]) { root = baseTags[this.type][0]; }
      var newModel = new UIElementModel(root);
      this.collection.push(newModel);
    },

    submitForm: function(e) {
      //alert("HEEEEY");
    },

    appendUIE: function(uieModel) {
      var newView = new UIElementView(uieModel);
      this.elems.appendChild(newView.el);
    },

    removeUIE: function(uieModel) {
      $('#' + uieModel.cid).remove();
    }
  });

  return UIElementListView;
});
