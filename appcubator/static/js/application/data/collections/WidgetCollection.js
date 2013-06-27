define([
  "backbone"
],

function() {


    var WidgetCollection = Backbone.Collection.extend({

      createThirdPartyLogin: function(layout, form, roleStr) {
        var widget = {};

        widget.type = "thirdpartylogin";
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";
        widget.data.class_name = uieState["forms"][0].class_name;
        widget.data.action = form.action;
        widget.data.provider = form.provider;
        widget.data.content = form.content;
        widget.data.container_info = {};
        widget.data.container_info.action = "thirdpartylogin";
        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetModel = new ContainerWidgetModel(widget);

        widgetModel.createLoginRoutes();

        if(!v1State.isSingleUser()) {
            widget.data.content = "Sign In w/" + form.provider;
            widget.data.userRole = roleStr;
        }
        return this.push(widgetModel);
      },

      createLoginForm: function(layout, form) {
        var widget = {};

        widget.type = 'form';
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";
        widget.data.class_name = uieState["forms"][0].class_name;

        widget.data.container_info = {};
        widget.data.container_info.entity = form.entity;
        widget.data.container_info.action = form.action;
        widget.data.container_info.form = form;
        widget.data.container_info.form.entity = 'User';

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetModel = new ContainerWidgetModel(widget);
        return this.push(widgetModel);
      },

      createSignupForm: function(layout, form, roleStr) {
        var widget = {};

        widget.type = 'form';
        widget.layout = layout;

        widget.data = {};
        widget.data.nodeType = "form";

        widget.data.container_info= {};
        widget.data.container_info.entity = v1State.get('users').getUserTableWithName(roleStr);
        widget.data.container_info.action = form.action;
        widget.data.container_info.form = form;
        widget.data.container_info.form.signupRole = roleStr;

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetSignupModel = new ContainerWidgetModel(widget);
        return this.push(widgetSignupModel);
      },

      createNodeWithFieldTypeAndContent: function(layout, type, content) {
        var widget = {};
        widget.type = "node";
        widget.layout = layout;

        widget.data = {};
        widget.data         = _.extend(widget.data, uieState[this.getFieldType(field)][0]);
        widget.data.content =  content;

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetModel = new WidgetModel(widget, true);
        return this.push(widgetModel);
      },

      createCreateForm: function(layout, entity) {
        var widget = {};
        widget.type = "form";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "create";
        widget.data.container_info.form = {};
        widget.data.container_info.form.entity = entity.get('name');

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetContainerModel = new ContainerWidgetModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createTable: function(layout, entity) {
        var widget = {};
        widget.type = "loop";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "table";

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetContainerModel = new ContainerWidgetModel(widget, true);
        return this.push(widgetContainerModel);
      },

      createList:function(layout, entity) {
        var widget = {};
        widget.type = "loop";
        widget.layout = layout;

        widget.data = {};
        widget.data.container_info = {};
        widget.data.container_info.entity = entity;
        widget.data.container_info.action = "show";

        var ContainerWidgetModel = require('models/ContainerWidgetModel');
        var widgetContainerModel = new ContainerWidgetModel(widget, true);
        return this.push(widgetContainerModel);
      }

    });

    return WidgetCollection;
  });
