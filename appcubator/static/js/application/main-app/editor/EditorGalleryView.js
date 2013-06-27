define([
  'collections/ElementCollection',
  'models/ContainerWidgetModel',
  'models/WidgetModel',
  'dicts/default-uielements',
  'dicts/constant-containers',
  'list'
  ],
  function(ElementCollection,
   ContainerWidgetModel,
   WidgetModel) {

    var EditorGalleryView = Backbone.View.extend({
      el                  : util.get('top-panel-bb'),
      allList             : util.get('all-list'),
      curId               : 'all-elements',
      dragActive          : false,
      css                 : 'editor-gallery',
      events : { },

      initialize   : function(widgetsCollection) {
       _.bindAll(this);

       this.widgetsCollection = widgetsCollection;
     },

     render: function() {
      // Basic UI Elements
      // Authentication Forms
      // CurrentUser Elements
      // All Create Forms, Tables, Lists
      // Context Entity Elements and Update Forms
      var self = this;
      util.loadCSS(this.css);
      this.allList = util.get('all-list');

      this.renderAuthenticationForms();
      this.renderCurrentUserElements();
      this.renderEntitiyFormsTablesLists();
      this.renderContextEntityForms();
      this.renderUIElementList();

      $(this.allList).find('li:not(.ui-draggable)').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
      this.$el.find('li').on('click', self.dropped);

      var list = new List('top-panel-bb', { valueNames: ['name']});
      return this;
    },

    renderUIElementList: function() {
      var self = this;
      var collection = new ElementCollection(defaultElements);

      var li = document.createElement('li');
      li.className = 'gallery-header ui-draggable';
      li.innerHTML = 'Design Elements';
      $(this.allList).append(li);

      collection.each(function(element) {
        if(element.get('className') == "buttons" ||
         element.get('className') == "textInputs" ||
         element.get('className') == "textAreas" ||
         element.get('className') == "dropdowns") return;

          self.appendUIElement(element);

      });
    },

    appendUIElement: function(elementModel) {
      var self = this;
      var li = document.createElement('li');
      li.className = 'uielement ' + elementModel.get('className');
      li.id='type-' + elementModel.get('className');
      li.innerHTML = '<span class="icon '+  elementModel.get('className') + '"></span><span class="name">'+ elementModel.get('text')+'</span>';
      $(this.allList).append(li);

      $(li).draggable({
        cursor  : "move",
        cursorAt: { top: 0, left: 0 },
        helper: function( event ) {
          return $(elementModel.get('el')).css('position','fixed');
        },
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
    },

    renderAuthenticationForms: function() {
      var li = document.createElement('li');
      li.className = 'gallery-header ui-draggable';
      li.innerHTML = 'Authentication';
      $(this.allList).append(li);

      var self = this;
      var tempLocalLogin = '<li id="entity-user-Local_Login" class="login authentication">'+
      '<span class="name">Login Form</span></li>';
      var tempLocalSignup = '<li id="entity-user-<%- signupRole %>" class="signup authentication">'+
      '<span class="name"><%= signupRole %> Sign Up</span></li>';

      $(self.allList).append(tempLocalLogin);
      v1State.get('users').each(function(user) {
        $(self.allList).append(_.template(tempLocalSignup, {signupRole: user.get('name')}));
      });


      var tempFb = '<li id="entity-user-facebook" class="facebook thirdparty authentication">' +
      '<span class="name">Facebook Login Button</span></li>';
      $(self.allList).append(tempFb);

      var tempTw = '<li id="entity-user-twitter" class="twitter thirdparty authentication">'+
      '<span class="name"> Twitter Button</span></li>';
      $(self.allList).append(tempTw);

      var tempLi = '<li id="entity-user-linkedin" class="linkedin thirdparty authentication">'+
      '<span class="name">LinkedIn Login Button</span></li>';
      $(self.allList).append(tempLi);
    },

    renderCurrentUserElements: function() {
      var li = document.createElement('li');
      li.className = 'gallery-header ui-draggable';
      li.innerHTML = 'Current User';
      $(this.allList).append(li);

      var self = this;
      var tempLi = ['<li class="current-user" id="current-user-<%= id %>">',
      '<span class="current-user-icon"></span>',
      '<span class="wide-text">Current User <%= field_name %></span>',
      '</li>'].join('\n');

      _(v1State.get('pages').models[pageId].getFields()).each(function(field) {
        if(field.isRelatedField()) return;
        var context = { id : field.cid, field_name : field.get('name') };
        $(self.allList).append(_.template(tempLi, context));
      });
    },

    renderEntitiyFormsTablesLists: function() {

      var li = document.createElement('li');
      li.className = 'gallery-header ui-draggable';
      li.innerHTML = 'Table Data';
      $(this.allList).append(li);


      var self = this;
      var tempCreateFormLi = ['<li class="entity-create-form" id="entity-<%= entity_id %>">',
      '<span class="create-form-icon"></span>',
      '<span class="wide-text"><%= entity_name %> Create Form</span>',
      '</li>'].join('\n');

      var tempTableLi      = ['<li class="entity-table" id="entity-<%= entity_id %>">',
      '<span class="table-icon"></span>',
      '<span class="wide-text"><%= entity_name %> Table</span>',
      '</li>'].join('\n');

      var tempListLi       = ['<li class="entity-list" id="entity-<%= entity_id %>">',
      '<span class="list-icon"></span>',
      '<span class="wide-text"><%= entity_name %> List</span>',
      '</li>'].join('\n');

      var tempSearchLi       = ['<li class="entity-searchbox" id="entity-<%= entity_id %>">',
      '<span class="list-icon"></span>',
      '<span class="wide-text"><%= entity_name %> Search Box</span>',
      '</li>'].join('\n');

      v1State.get('tables').each(function(entityModel) {
        var context = { entity_id : entityModel.cid, entity_name : entityModel.get('name')};
        $(self.allList).append(_.template(tempCreateFormLi, context));
        $(self.allList).append(_.template(tempTableLi, context));
        $(self.allList).append(_.template(tempListLi, context));
        $(self.allList).append(_.template(tempSearchLi, context));
      });

    },

    renderContextEntityForms: function() {

      if(g_contextCollection.models.length > 0) {
        var li = document.createElement('li');
        li.className = 'gallery-header ui-draggable';
        li.innerHTML = 'Page Context Data';
        $(this.allList).append(li);
      }


      var self = this;
      var tempLi = ['<li class="context-entity" id="context-field-<%= entity_id %>-<%= field_id %>">',
      '<span class="plus-icon"></span>',
      '<span class="wide-text"><%= entity_name %> <%= field_name %></span>',
      '</li>'].join('\n');

      var tempLiForm = ['<li class="context-entity-update" id="update-<%= entity_id %>">',
      '<span class="form-icon"></span>',
      '<span class="wide-text"><%= entity_name %> Update Form</span>',
      '</li>'].join('\n');


      g_contextCollection.each(function(entity) {
        var entityName = entity.get('name');
        var entityId = entity.cid;
        var context = {entity_id : entityId, entity_name : entityName};
        //$(self.allList).append(_.template(tempLiForm, context));

        entity.get('fields').each(function(field) {
          var context = { entity_id : entityId, entity_name : entityName,
            field_id : field.cid, field_name: field.get('name') };

            $(self.allList).append(_.template(tempLi, context));
          });

      });
    },

    dropped : function(e, ui) {
      var left = 0; var top = 1;

      if(e.type != 'click') {
        left = this.findLeft(e, ui);
        top  = this.findTop(e, ui);
      }

      layout = { top: top, left: left };

      var targetEl = e.target;
      if(e.target.tagName != "LI") {
        targetEl = e.target.parentNode;
      }

      var className = targetEl.className;
      var id = targetEl.id;

      return this.createElement(layout, className, id);
    },

    createElement: function(layout, className, id) {

      var hash, entityCid, formCid, action, formType;
      var entity, form, field;
      var widget = {};
      widget.layout = layout;

      if(/(login)/.exec(className)) {
        formType = String(id).replace('entity-user-','').replace('_', ' ');
        return this.widgetsCollection.createLoginForm(layout, constantContainers[formType]);

      }
      else if(/(thirdparty)/.exec(className)) {
        formType = String(id).replace('entity-user-','').replace('_', ' ');
        form = constantContainers[formType];
        return this.widgetsCollection.createThirdPartyLogin(layout, form);

      }
      else if(/(signup)/.exec(className)) {
        var signupRole = id.replace('entity-user-', '');
        form = constantContainers["Sign Up"];

        return this.widgetsCollection.createSignupForm(layout, form, signupRole);
      }
      else if(/(context-entity)/.exec(className)) {
        hash = String(id).replace('context-field-','').split('-');
        entity = v1State.get('tables').get(hash[0]);
        field = entity.get('fields').get(hash[1]);

        var type = this.getFieldType(field);
        var editorContext = this.editorContext ? this.editorContext : "page";
        var content =  '{{' + editorContext +'.'+ entity.get('name') +'.'+field.get('name')+'}}';

        return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, content);
      }
      else if(/(context-nested-entity)/.exec(className)) {
        hash = String(id).replace('context-field-','').split('-');
        entity = v1State.get('tables').get(hash[0]);
        nested_entity = v1State.getTableModelWithCid(hash[1]);
        field = nested_entity.getFieldsColl().get(hash[2]);

        var type = this.getFieldType(field);
        var editorContext = this.editorContext ? this.editorContext : "page";
        var content =  '{{' + editorContext +'.'+ entity.get('name') +'.'+ nested_entity.get('name') + '.' +field.get('name')+'}}';

        return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, content);
      }
      else if(/(entity)/.exec(className)) {
        cid  = String(id).replace('entity-','');
        var entity = v1State.get('tables').get(cid);

        /*widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = */

        if(/(entity-create-form)/.exec(className)) {
          return this.widgetsCollection.createCreateForm(layout, entity);
        }
        if(/(entity-table)/.exec(className)) {
          return this.widgetsCollection.createTable(layout, entity);
        }
        if(/(entity-list)/.exec(className)) {
          return this.widgetsCollection.createList(layout, entity);
        }
      }
      else if (/(current-user)/.exec(className)) {
        var field_id = String(id).replace('current-user-','');
        field = _(v1State.get('pages').models[pageId].getFields()).find(function(fieldModel) {
          return (fieldModel.cid == field_id);
        });
        //field = v1State.get('users').getCommonProps().get('fields').get(field_id);


        entity = v1State.get('users');
        content =  '{{CurrentUser.'+field.get('name')+'}}';

        widget.type         = "node";
        widget.data         = {};
        widget.data         = _.extend(widget.data, uieState[this.getFieldType(field)][0]);
        widget.data.content =  content;
        var widgetModel = new WidgetModel(widget);
        this.widgetsCollection.push(widgetModel);

        return widgetModel;
      }
      else if (/(uielement)/.exec(className)){
        var type    = id.replace('type-','');
        widget.data = {};
        widget.data.nodeType = type;
        widget.type = "node";

        if(type == "imageslider") {
          widget.type = "gallery";
          widget.data.container_info = {};
          widget.data.container_info.action = "imageslider";
          var widgetContainerModel = new ContainerWidgetModel(widget, true);
          this.widgetsCollection.push(widgetContainerModel);
          return widgetContainerModel;
        }

        if(type == "twitterfeed") {
          widget.type = "gallery";
          widget.data.container_info = {};
          widget.data.container_info.action = "twitterfeed";
          var widgetContainerModel = new ContainerWidgetModel(widget, true);
          this.widgetsCollection.push(widgetContainerModel);
          return widgetContainerModel;
        }

        if(type == "facebookshare") {
          widget.type = "gallery";
          widget.data.container_info = {};
          widget.data.container_info.action="facebookshare";
          var widgetContainerModel = new ContainerWidgetModel(widget, true);
          this.widgetsCollection.push(widgetContainerModel);
          return widgetContainerModel;
        }

        widget.data = _.extend(widget.data, uieState[type][0]);


        if(this.entity) { widget.context = this.entity.get('name'); }

        var model = new WidgetModel(widget, true);
        this.widgetsCollection.push(model);
        return model;
      }
      else {
        console.error("UFO");
      }
    },

    findLeft: function(e, ui) {
      var offsetLeft = document.getElementById('elements-container').offsetLeft;
      var left = Math.round((e.pageX - offsetLeft)/GRID_WIDTH);
      if(left < 0) left = 0;
      if(left + 4 > 12) left = 8;

      return left;
    },

    findTop: function(e, ui) {
      var offsetScrolledTop = $('#elements-container').offset().top;
      var top  = Math.round((e.pageY - offsetScrolledTop)/GRID_HEIGHT);
      if(top < 0) top = 0;

      return top;
    },

    getFieldType: function (fieldModel) {
      var type;

      switch(fieldModel.get('type')) {
        case "text":
        case "date":
        case "number":
        case "email":
        type = "texts";
        break;
        case "image":
        type = "images";
        break;
      }

      return type;
    }

  });

return EditorGalleryView;
});
