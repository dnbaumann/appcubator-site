var pageId = 0;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;
var v1State = {};

define([
  "editor/EditorView",
  "models/AppModel",
  "models/UserTableModel",
  "collections/PageCollection",
  "collections/MobilePageCollection",
  "collections/UserRolesCollection",
  "editor/KeyDispatcher",
  "editor/MouseDispatcher",
  "comp",
  "backbone"
  ],
  function( EditorView,
    AppModel,
    UserEntityModel,
    PageCollection,
    MobilePageCollection,
    UserRolesCollection,
    KeyDispatcher,
    MouseDispatcher) {

    util.loadCSS = function(str) { console.log("Tried to load: "+ str); };

    v1State = new Backbone.Model();
    v1State = new AppModel(appState);
    v1State.set('pages', new PageCollection(appState.pages||[]));
    v1State.set('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

    g_guides = {};
    keyDispatcher  = new KeyDispatcher();
    mouseDispatcher  = new MouseDispatcher();

    var AppRouter = {};
    $('.page').fadeOut();
    AppRouter.tutorialDirectory = [5];

    if(AppRouter.view) AppRouter.view.remove();
    var cleanDiv = document.createElement('div');
    cleanDiv.className = "clean-div editor-page";
    $(document.body).append(cleanDiv);

    AppRouter.view  = new EditorView({pageId: pageId});
    AppRouter.view.setElement(cleanDiv).render();

    var fEvent = {};
    var fUi = {};
    fEvent.type = "drop";
    fEvent.pageX = 200;
    fEvent.pageY = 200;

    var getValidation = function(data, callback) {
      $.ajax({
        type: "POST",
        url: "/backend/validate/",
        data: JSON.stringify(data),
        complete: callback
      });
    };

    var validateBackend = function() {

      var callback = jasmine.createSpy();

      getValidation(v1State.toJSON(), callback);
      waitsFor(function() {
        return callback.callCount > 0;
      });
      runs(function(data) {
        expect(callback.mostRecentCall.args[1]).toEqual("success");
        expect(callback.mostRecentCall.args[0].responseText).toEqual("Swag!");
      });

    };

    describe("Local Login Form", function () {

      var id = "entity-user-Local_Login";
      var className = "login authentication ui-draggable";
      var loginForm = document.getElementById(id);

      it("is on gallery.", function () {
        expect(loginForm).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = loginForm;
        fE.target.className = className;
        fE.target.id = id;

        /* Check if exists */
        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        /* Check validation */
        validateBackend();
      });

    });

    describe("Sign Up Form", function () {

      var id = "entity-user-Sign_Up";
      var className = "login authentication ui-draggable";
      var galleryElement = document.getElementById(id);

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped on the editor", function() {

        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        /* Check validation */
        validateBackend();
      });
    });

    describe("Facebook Login Form", function () {
      var id = "entity-user-facebook";
      var className = "facebook authentication ui-draggable";
      var galleryElement = document.getElementById(id);

      it("is on gallery", function() {     /* Check if on gallery */
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);

      });

      it("is valid on the backend", function() {
        validateBackend();
      });

    });

    describe("Twitter Login Form", function () {
      var id = "entity-user-twitter";
      var className = "twitter authentication ui-draggable";
      var galleryElement = document.getElementById(id);

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped on the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });


    describe("LinkedIn Login Form", function () {
      var id = "entity-user-linkedin";
      var className = "linkedin authentication ui-draggable";
      var galleryElement = document.getElementById(id);

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

    });

    describe("Current User", function () {
      var className = 'current-user ui-draggable';
      var id = 'current-user-c4';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Create Form", function () {
      var className = 'entity-create-form ui-draggable';
      var id = 'entity-c11';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("List", function () {
      var className = 'entity-list ui-draggable';
      var id = 'entity-c11';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Image Node", function () {
      var className = 'uielement images ui-draggable';
      var id = 'type-images';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Header Node", function () {
      var className = 'uielement headerTexts ui-draggable';
      var id = 'type-headerTexts';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Text Node", function () {
      var className = 'uielement texts ui-draggable';
      var id = 'type-texts';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Link Node", function () {
      var className = 'uielement links ui-draggable';
      var id = 'type-links';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Line Node", function () {
      var className = 'uielement lines ui-draggable';
      var id = 'type-lines';
      var galleryElement = document.getElementById(id);

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe("Box Node", function () {
      var className = 'uielement boxes ui-draggable';
      var id = 'type-boxes';
      var galleryElement = document.getElementById(id);

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;
        fE.target.className = className;
        fE.target.id = id;

        var model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });
    });

    describe('Navbar', function() {
      var model = v1State.get('pages').at(pageId).get('navbar');
      var links = model.get('links');
      var navbar = AppRouter.view.navbar;

      it('renders the brandName', function() {
        //set brandName to appState name to start
        var view_brandName = navbar.$('#brand-name').text('thisisirrelevant').text();
        var model_brandName = model.get('brandName') || v1State.get('name');
        expect(model_brandName).toEqual(view_brandName);
      });

      it('updates the brandName', function() {
        var old_brandname = model.get('brandName') || v1State.get('name');
        model.set('brandName', "DERPY");
        var brandName = navbar.$('#brand-name').text();
        expect(model.get('brandName')).toEqual(brandName);
      });

      it('renders correct number of elements', function() {
        var numLinks = links.length;
        var numListItems = navbar.$('#links li').length;
        expect(numLinks).toEqual(numListItems);
      });

      it('adds new links to navbar', function() {
        var initialLength = $(navbar.el).find('#links li').length;
        links.add({
          title: "DERPTASTIC",
          url: 'http://www.google.com/'
        });
        var after = $(navbar.el).find('#links li');
        var finalLength = after.length;
        expect(finalLength).toEqual(initialLength + 1);
        var lastLink = after.last()[0].children[0];
        expect(lastLink.innerText).toEqual('DERPTASTIC');
      });

      it('removes links from navbar', function() {
        var initialLength = $(navbar.el).find('#links li').length;
        links.remove(links.first());
        var finalLength = $(navbar.el).find('#links li').length;
        expect(finalLength).toEqual(initialLength - 1);
      });
    });

    describe('Footer', function() {
      var model = v1State.get('pages').at(pageId).get('footer');
      var links = model.get('links');
      var footer = AppRouter.view.footer;

      it('renders the custom text', function() {
        //set brandName to appState name to start
        var view_customText = footer.$('#customText').text();
        var model_customText = model.get('customText') || "Add custom footer text here";
        expect(model_customText).toEqual(view_customText);
      });

      it('updates the custom text', function() {
        var old_customText = model.get('customText') || "Add custom footer text here";
        model.set('customText', "DERPY");
        var customText = footer.$('#customText').text();
        expect(model.get('customText')).toEqual(customText);
      });

      it('renders correct number of elements', function() {
        var numLinks = links.length;
        var numListItems = footer.$('#links li').length;
        expect(numLinks).toEqual(numListItems);
      });

      it('adds new links to footer', function() {
        var initialLength = $(footer.el).find('#links li').length;
        links.add({
          title: "DERPTASTIC",
          url: 'http://www.google.com/'
        });
        var after = $(footer.el).find('#links li');
        var finalLength = after.length;
        expect(finalLength).toEqual(initialLength + 1);
        var lastLink = after.last()[0].children[0];
        expect(lastLink.innerText).toEqual('DERPTASTIC');
      });

      it('removes links from footer', function() {
        var initialLength = $(footer.el).find('#links li').length;
        links.remove(links.first());
        var finalLength = $(footer.el).find('#links li').length;
        expect(finalLength).toEqual(initialLength - 1);
      });
    });
  });
