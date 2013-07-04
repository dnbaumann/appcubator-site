define([
  'collections/TableCollection',
  'models/UserTableModel',
  'models/TableModel',
  'app/entities/ShowDataView',
  'app/entities/UserTableView',
  'app/entities/TablesView',
  'app/entities/CreateRelationView',
  'app/entities/RelationsView',
  'mixins/ErrorDialogueView'
],

function(TableCollection,
         UserTableModel,
         TableModel,
         ShowDataView,
         UserTableView,
         TablesView,
         CreateRelationView,
         RelationsView,
         ErrorDialogueView) {

    var EntitiesView = Backbone.View.extend({
      css: 'entities',
      title: 'Tables',
      events : {
        'click #add-role'        : 'clickedAddUserRole',
        'keyup #add-role-form'   : 'createUserRole',
        'click #add-entity'      : 'clickedAddTable',
        'keyup #add-entity-form' : 'createTable',
        'click #add-relation'    : 'showCreateRelationForm',
        'click .related-tag'     : 'scrollToRelation'
      },

      initialize: function() {
        _.bindAll(this);
        util.loadCSS(this.css);
        this.tablesView     = new TablesView(v1State.get('tables'), false);
        this.userTablesView = new TablesView(v1State.get('users'), true);
        this.relationsView = new RelationsView();
        this.createRelationView = new CreateRelationView();
        this.title = "Tables";
      },

      render : function() {
        this.$el.html(_.template(util.getHTML('entities-page'), {}));
        this.renderTables();
        this.renderRelations();
        return this;
      },

      renderTables: function() {
        //don't render tables unless parent view has been rendered
        if(!this.$el) {
          return this;
        }
        this.$('#tables').append(this.tablesView.render().el);
        this.$('#users').append(this.userTablesView.render().el);
      },

      renderRelations: function() {
        util.get('relations').appendChild(this.createRelationView.render().el);
        util.get('relations').appendChild(this.relationsView.render().el);
      },

      clickedAddUserRole: function(e) {
        $(e.currentTarget).hide();
        $('#add-role-form').fadeIn().focus();
      },

      createUserRole: function(e) {
        // if escape key pressed, skip to hiding form/showing btn
        if(e.keyCode !== 27) {
          // only save if enter button is pressed
          if(e.keyCode !== 13) {
            return;
          }
          var name = e.target.value;
          var elem = new UserTableModel({
            name: name
          });

          if(!v1State.get('users').isNameUnique(name)) {
            new ErrorDialogueView({text: 'Page name should be unique.'});
            return;
          }
          if(!util.isAlphaNumeric(name)){
            new ErrorDialogueView({text: 'Page name should be alphanumberic.'});
            return;
          }
          if(util.doesStartWithKeywords(name)){
            new ErrorDialogueView({text: 'Page name should not start with "Page", "Form" or "loop".'});
            return;
          }
          v1State.get('users').add(elem);
          return elem;
        }

        e.target.value = '';
        $('#add-role').fadeIn();
        $(e.target).hide();

        e.preventDefault();
      },

      clickedAddTable: function(e) {
        $(e.currentTarget).hide();
        $('#add-entity-form').fadeIn().focus();
      },

      createTable: function(e) {
        // if escape key pressed, skip to hiding form/showing btn
        if(e.keyCode !== 27) {
          // only save if enter button is pressed
          if(e.keyCode !== 13) {
            return;
          }
          var name = e.target.value;
          var elem = new TableModel({
            name: name,
            fields: []
          });
          if(!v1State.get('tables').isNameUnique(name)) {
            new ErrorDialogueView({text: 'Page name should be unique.'});
            return;
          }
          if(!util.isAlphaNumeric(name)){
            new ErrorDialogueView({text: 'Page name should be alphanumberic.'});
            return;
          }
          if(util.doesStartWithKeywords(name)){
            new ErrorDialogueView({text: 'Page name should not start with "Page", "Form" or "loop".'});
            return;
          }

          v1State.get('tables').add(elem);
          return elem;
        }

        e.target.value = '';
        $('#add-entity').fadeIn();
        $(e.target).hide();

        e.preventDefault();
      },

      showCreateRelationForm: function() {
        var self = this;
        this.createRelationView.$el.fadeIn('fast');
        util.scrollToElement(self.$('#new-relation'));
      },

      scrollToRelation: function(e) {
        e.preventDefault();
        var hash = e.currentTarget.hash;
        if(hash === '#relation-new') {
          this.showCreateRelationForm();
          return;
        }
        util.scrollToElement($(hash));
      }
    });

    return EntitiesView;

});
