define([
  'require',
  'collections/FieldsCollection',
  'backbone'
], function(require) {

  var FieldsCollection = require('collections/FieldsCollection');
  var Backbone         = require('backbone');

  var TableModel = Backbone.Model.extend({
    defaults: {
      fields: new FieldsCollection()
    },

    initialize: function(bone) {

      if(typeof bone === "string") {
        if(bone === "User") {
          alert('TableModel init isnt supposed to receive user');
          return;
        }
        bone = _.findWhere(appState.entities, {name : bone});
      }

      if(bone.name) {
        this.set('name', bone.name||"New Table");
      }

      this.set('fields', new FieldsCollection());
      if(bone.fields) {
        this.get('fields').add(bone.fields);
      }
      this.isUser = false;
    },

    toJSON: function () {
      var json = {};
      json = _.clone(this.attributes);
      json.fields = this.get('fields').toJSON();
      return json;
    },

    addFieldsWithNames: function(nameArr) {
      _(nameArr).each(function(name) {
        this.get('fields').push({ name: name });
      }, this);
    },

    getFieldsColl: function() {
      var arr = this.get('fields');
      return arr;
    },

    getNormalFields: function() {
      var normalFields = this.get('fields').filter(function(field) { return !field.isRelatedField(); });
      return normalFields;
    },

    getRelationalFields: function() {
      var relationalFields = this.get('fields').filter(function(field) { return field.isRelatedField(); });
      return relationalFields;
    },

    hasMoneyField: function() {
      var hasMoneyField = false;
      this.getFieldsColl().each(function(_fieldM) {
        if(_fieldM.get('type') == "money") {
          hasMoneyField = true;
          return;
        }
      }, this);
      return hasMoneyField;
    }
  });

  return TableModel;
});
