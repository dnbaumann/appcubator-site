define(['backbone'], function(Backbone) {
  var UrlModel = Backbone.Model.extend({
    defaults : {
    },

    initialize: function(bone) {
      var urlparts = [];
      if(bone.urlparts) {
        urlparts = _(bone.urlparts).map(function(value) {
          return {
            value: value
          };
        });
      }
      this.set('urlparts', new Backbone.Collection(urlparts));
    },

    getAppendixString: function() {
      return this.get('urlparts').pluck('value').join('/');
    },

    getUrlString: function(appSubdomain) {
      return 'http://' + (appSubdomain||'yourapp.com') + '/' + this.get('page_name') + '/' +  this.getAppendixString();
    },

    addUrlPart: function(value) {
      this.get('urlparts').push(value);
    },

    removeUrlPart: function(value) {
      var value = this.get('urlparts').remove(value);
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.urlparts = json.urlparts.pluck('value');
      return json;
    }
  });

  return UrlModel;
});
