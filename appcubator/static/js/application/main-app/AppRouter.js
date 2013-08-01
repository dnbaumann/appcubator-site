define([
        "mixins/SimpleModalView",
        "mixins/ErrorDialogueView",
        "tutorial/TutorialView",
        "app/emails/EmailsView",
        "app/DeployView",
        "app/SoftErrorView",
        "mixins/SimpleDialogueView",
        "backbone",
        "bootstrap",
        "util",
        "comp"
], function(SimpleModalView,
          ErrorDialogueView,
          TutorialView,
          EmailsView,
          DeployView,
          SoftErrorView,
          SimpleDialogueView) {

    var AppRouter = Backbone.Router.extend({

        routes: {
            "app/:appid/info/*tutorial"     : "info",
            "app/:appid/tables/*tutorial"   : "tables",
            "app/:appid/gallery/*tutorial"  : "themes",
            "app/:appid/pages/*tutorial"    : "pages",
            "app/:appid/editor/:pageid/"       : "editor",
            "app/:appid/mobile-editor/:pageid/": "mobileEditor",
            "app/:appid/emails/*tutorial"   : "emails",
            "app/:appid/*tutorial"          : "index",
            "app/:appid/*anything/"            : "index"
        },

        tutorialDirectory: [0],

        initialize: function() {
            var self = this;
            AppRouter.view = null;
            _.bindAll(this);
            $('#save').on('click', this.save);
            $('#tutorial').on('click', function(e) {
                self.showTutorial();
                window.history.pushState(null, null, window.location.href.concat("tutorial/"));
            });
            $('.toggle-invitations-modal').on('click', function(e) {
                require(['app/InvitationsView'], function(InvitationsView) {
                    new InvitationsView();
                });
                e.preventDefault();
            })

      keyDispatcher.bindComb('meta+s', this.save);
      keyDispatcher.bindComb('ctrl+s', this.save);

      var autoSave = setInterval(this.save, 30000);
        },

        index: function (appId, tutorial) {
            var self = this;
            require(['app/OverviewPageView'], function(OverviewPageView){
                self.tutorialDirectory = [0];
                self.changePage(OverviewPageView, tutorial, function() {
                });
                olark('api.box.show');
            });
        },

        info: function(appId, tutorial) {
            var self = this;
            require(['app/AppInfoView'], function(InfoView){
                self.tutorialDirectory = [7];
                self.changePage(InfoView, tutorial, function() {
                    $('.menu-app-info').addClass('active');
                });
                olark('api.box.show');
            });
        },

        tables: function(appId, tutorial) {
            var self = this;
            require(['app/entities/EntitiesView'], function(EntitiesView){
                self.tutorialDirectory = [1];
                self.changePage(EntitiesView, tutorial, function() {
                    self.trigger('entities-loaded');
                    $('.menu-app-entities').addClass('active');
                });
                olark('api.box.show');
            });
        },

        themes: function(appId, tutorial) {
            var self = this;
            self.tutorialDirectory = [4];
            require(['app/ThemesGalleryView'], function(ThemesGalleryView){
                self.changePage(ThemesGalleryView, tutorial, function() {
                    self.trigger('themes-loaded');
                    $('.menu-app-themes').addClass('active');
                });
                olark('api.box.show');
            });
        },

        pages: function(appId, tutorial) {
            var self = this;
            self.tutorialDirectory = [2];
            require(['app/pages/PagesView'], function(PagesView){
                $('.page').fadeIn();
                self.changePage(PagesView, tutorial, function() {
                    self.trigger('pages-loaded');
                    $('.menu-app-pages').addClass('active');
                });
                olark('api.box.show');
            });
        },

        editor: function(appId, pageId) {
            var self = this;
            self.tutorialDirectory = [3];
            require(['editor/EditorView'], function(EditorView){
                $('.page').fadeOut();
                if(AppRouter.view) AppRouter.view.close();
                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                $(document.body).append(cleanDiv);

                AppRouter.view  = new EditorView({pageId: pageId});
                AppRouter.view.setElement(cleanDiv).render();

                self.trigger('editor-loaded');

                olark('api.box.hide');
                self.changeTitle(AppRouter.view.title);
            });
        },

        mobileEditor: function(appId, pageId) {
            var self = this;
            $('.page').fadeOut();
            self.tutorialDirectory = [3];
            require(['m-editor/MobileEditorView'], function(MobileEditorView){
                if(AppRouter.view) AppRouter.view.close();
                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                $(document.body).append(cleanDiv);

                AppRouter.view  = new MobileEditorView({pageId: pageId});
                AppRouter.view.setElement(cleanDiv).render();

                olark('api.box.hide');
                self.changeTitle(AppRouter.view.title);
            });
        },

        emails: function(appId, tutorial) {
            var self = this;
            self.tutorialDirectory = [6];
            this.changePage(EmailsView, tutorial, function() {
                $('.menu-app-emails').addClass('active');
            });
        },

        changePage: function(newView, tutorial, post_render) {
            if(AppRouter.view) AppRouter.view.close();
            var cleanDiv = document.createElement('div');
            cleanDiv.className = "clean-div";
            var mainContainer = document.getElementById('main-container');
            mainContainer.appendChild(cleanDiv);

            AppRouter.view = new newView();
            AppRouter.view.setElement(cleanDiv).render();
            $('.active').removeClass('active');
            this.changeTitle(AppRouter.view.title);
            $("html, body").animate({ scrollTop: 0 });
            $('.page').fadeIn();
            $('.pull-right.dropd').removeClass('open');
            post_render.call();
            if(tutorial && tutorial === 'tutorial/') {
                this.showTutorial();
            }
            else if(tutorial) {
                // remove random ending string from url path
                this.navigate(window.location.pathname.replace(tutorial, ''), {replace: true});
            }
            else {
                if(this.tutorialIsVisible) {
                    this.tutorial.closeModal();
                }
            }
        },

        deploy: function(callback) {
            var self = this;
            var before_deploy = new Date().getTime();
            $.ajax({
                type: "POST",
                url: '/app/'+appId+'/deploy/',
                success: function(data) {
                    var deploy_time = (new Date().getTime() - before_deploy)/1000;
                    if(callback) callback();
                    // open a modal based on deploy response
                    if(data.errors) {
                        var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
                        if(DEBUG) {
                            content = { text: data.errors };
                        }
                        new ErrorDialogueView(content);
                        util.log_to_server('deployed app', {status: 'FAILURE', deploy_time: deploy_time + " seconds", message: data.errors}, appId);
                    }
                    else {
                      new DeployView(data);
                      util.log_to_server('deployed app', {status: 'success', deploy_time: deploy_time + " seconds"}, appId);
                      self.trigger('deployed');
                    }
                },
                error: function(data) {
                    var deploy_time = (new Date().getTime() - before_deploy)/1000;
                    var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
                    if(DEBUG) {
                        content = { text: data.responseText };
                    }
                    new ErrorDialogueView(content);
                    util.log_to_server('deployed app', {status: 'FAILURE', deploy_time: deploy_time + " seconds", message: data.responseText}, appId);
                },
                dataType: "JSON"
            });
        },

        save: function(e) {
            if(v1.errorFlag === true) return;
            if(appId === 0) return;

            $('#save-icon').attr('src', '/static/img/ajax-loader-white.gif');
            var $el = $('.menu-button.save');
            $el.fadeOut().html("<span>Saving...</span>").fadeIn();

            var self = this;
            appState = v1State.toJSON();

            var successHandler = function(data) {
                util.dontAskBeforeLeave();
                v1.errorFlag = false;

                v1State.set('version_id', data.version_id);

                $('#save-icon').attr('src', '/static/img/checkmark.png').hide().fadeIn();
                var timer = setTimeout(function(){
                    $('#save-icon').attr('src', '/static/img/save.png').hide().fadeIn();
                    clearTimeout(timer);
                }, 1000);
                $('.menu-button.save').html("<span>Saved</span>").fadeIn();

                if( (typeof(callback) !== 'undefined') && (typeof(callback) == 'function') ) {
                    callback();
                }

                var timer2 = setTimeout(function(){
                    $el.html("<span>Save</span>").fadeIn();
                    clearTimeout(timer2);
                }, 3000);
            };
            var softErrorHandler = function(jqxhr) {
                console.log("HANDLING SOFT ERROR");
                var data = JSON.parse(jqxhr.responseText);
                v1State.set('version_id', data.version_id);
                //v1.errorFlag = true;
                //var content = { text: "Warning: " + data.message + ' We saved your progress, but you need to fix this before deploying again. FYI, this occurred in ' + data.path + '.' };
                //new ErrorDialogueView(content, function() { v1.errorFlag = false;});
                new SoftErrorView({text: data.message, path: data.path });
            };
            var browserConflictHandler = function(jqxhr) {
                new ErrorDialogueView({text:"Looks like you (or someone else) made a change to your app in another browser window. Please make sure you only use one window with Appcubator or you may end up overwriting your app with an older version. Please refresh the browser to get the updated version of your app."}, function() { v1.errorFlag = false;});
            };
            var hardErrorHandler = function(jqxhr) {
                v1.errorFlag = true;
                var content = "";
                if(DEBUG)
                    content = { text: jqxhr.responseText };
                else
                    content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
                new ErrorDialogueView(content, function() { v1.errorFlag = false; });
            };

            // for now, no difference
            var notFoundHandler = hardErrorHandler;

            $.ajax({
                type: "POST",
                url: '/app/'+appId+'/state/',
                data: JSON.stringify(appState),
                statusCode: {
                    200: successHandler,
                    400: softErrorHandler,
                    409: browserConflictHandler,
                    500: hardErrorHandler,
                    404: notFoundHandler,
                },
                dataType: "JSON"
            });

            if(e) e.preventDefault();
            return false;
        },

        showTutorial: function(dir) {
            var inp = (dir) ? [dir] : this.tutorialDirectory;
            if(this.tutorialIsVisible) {
                this.tutorial.chooseSlide(inp, false);
            }
            else {
                this.tutorial = new TutorialView(inp);
                this.tutorialIsVisible = true;
            }
        },

        betaCheck: function(data) {
            if(data.percentage > 30 && data.feedback === true) {
                $('.notice').css('height', '118px');
                $('.notice').html('<h3 class="">Thank you for joining Appcubator Private Beta program!</h3><div>You can claim your free domain from <a class="menu-app-info">Domain & SEO</a> page.</div>');
                v1.menuBindings();
            }

            if(data.percentage > 30) {
                $('#tutorial-check').prop('checked', true);
            }
            if(data.feedback === true) {
                $('#feedback-check').prop('checked', true);
            }
        },

        changeTitle: function(title) {
            var newTitle = "";
            if(title) {
                newTitle = " | " + title;
            }
            document.title = "Appcubator" + newTitle;
        }
    });

    return AppRouter;

});
