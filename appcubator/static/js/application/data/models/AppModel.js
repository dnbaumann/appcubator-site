define([
  'models/AppInfoModel',
  'collections/UserRolesCollection',
  'collections/TableCollection',
  'collections/PageCollection',
  'collections/MobilePageCollection',
  'collections/EmailCollection'
],
function(AppInfoModel,
         UserRolesCollection,
         TableCollection,
         PageCollection,
         MobilePageCollection,
         EmailCollection) {

  var AppModel = Backbone.Model.extend({

    currentPage: null,
    isMobile: false,

    initialize: function(appState) {
      if(!appState) return;

      this.set('info', new AppInfoModel(appState.info || {}));
      this.set('users', new UserRolesCollection(appState.users||[]));
      this.set('tables', new TableCollection(appState.tables||[]));
      this.set('emails', new EmailCollection(appState.emails || []));
    },

    getCurrentPage: function() {
      return this.currentPage;
    },

    getPages: function () {
      if(!this.isMobile) {
        return this.get('pages');
      }
      else {
        return this.get('mobilePages');
      }
    },

    getTableModelWithName: function(nameStr) {
      var tableM = this.get('tables').getTableWithName(nameStr);
      if(!tableM) tableM = this.get('users').getTableWithName(nameStr);
      return tableM;
    },

    getTableModelWithCid: function(cid) {
      var tableM = this.get('tables').get(cid);
      if(!tableM) tableM = this.get('users').get(cid);
      return tableM;
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.info = json.info.toJSON();
      json.users = json.users.toJSON();
      json.tables = json.tables.toJSON();
      if(json.pages) json.pages = json.pages.toJSON();
      if(json.mobilePages) json.mobilePages = json.mobilePages.toJSON();
      json.emails = json.emails.toJSON();

      return json;
    }
  });

  return AppModel;
});
