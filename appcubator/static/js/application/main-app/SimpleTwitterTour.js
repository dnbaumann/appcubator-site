define([
  "tourist-omer"
  ],
  function(TouristOmer) {

    var steps = [
    /*
     * Question btn
     */
     {
      ind     : 1,
      title   : 'Questions',
      content : 'If you have questions during the walkthrough, click the question marks for more info.',
      loc     : "right center, left center",
      target  : $('.qm-btn'),
      url     : '/',
      nextButton: true,
      highlightTarget: true
    },
    /*
     * Done with Tables. Going to pages.
     */
     {
      ind     : 2,
      title   : 'Let\'s get started!',
      content : '<em>Click on <strong>Pages</strong> to start editing your pages.</em>',
      loc     : "top center, bottom center",
      target  : $('.menu-app-pages'),
      url: '/tables/',
      setup: function(tour, options) {
        v1.bind('pages-loaded', function() {
          tour.next();
        });
      }
    },
    {
      ind     : 3,
      title   : 'Pages',
      content : 'Here you can edit and delete your site\'s pages.',
      loc     : "left top, right top",
      url     : '/pages/',
      target  : $('.page-view'),
      nextButton: true,
      setup: function(tour, options) {
        // return { target: .first() };
      }
    },
    /*
     * Add New Page
     */
    {
      ind     : 4,
      title   : 'A New Page',
      content : 'Let\'s create a new page.</p><p><em>Click this button and enter <strong>Tweet Feed</strong></em>',
      loc     : "left top, right top",
      url     : '/pages/',
      target  : $('#create-page-box'),
      setup: function(tour, options) {
        feedPageAdded = function(page) {
          console.log(page);
          if(page.get('name') == "Tweet Feed") {
            tour.next();
          }
          else {
            alert("Make sure you call the page 'Tweet Feed'");
            v1State.get('pages').remove(page.cid);
          }
        };
        v1State.get('pages').bind('add', feedPageAdded);
        //return { target };
      },
      teardown: function() {
        v1State.get('pages').unbind('add', feedPageAdded);
      }
    },
    /*
     * Click Edit Page
     */
    {
      ind     : 5,
      title   : 'Editing a Page',
      content : 'Here you can edit your home page. <em>Click <strong>Edit Page</strong></em>',
      loc     : "left top, right top",
      url     : '/pages/',
      target  : $('.page-view'),
      setup: function(tour, options) {
        $('.page-view').one('click', tour.next);
      },
      teardown: function() {
        //v1.unbind('editor-loaded');
      }
    },
    {
      ind     : 5,
      title   : 'Pick a Quick Template',
      content : 'Templates will give you a quick layout to start with. We\'ll go with the simple one for now and click the "Blank Page"',
      loc     : "left center, right center",
      url     : '/pages/',
      target  : $('#page-3'),
      setup: function(tour, options) {
        $('#page-3').one('click', tour.next);
      },
      teardown: function() {
        //v1.unbind('editor-loaded');
      }
    },
    /*
     * Welcome to Editor
     */
    {
      ind     : 6,
      title   : 'Welcome to Editor',
      content : 'What you see is what you get. You can drag elements onto the page and play around with them.',
      loc     : "right top, left bottom",
      nextButton: true,
      url      : '/editor/0/',
      target   : $('.search-panel')
    },
    /*
     * Save Early, ssave often
     */
    {
      ind     : 7,
      title   : 'Saving Your Progress',
      content : 'Save early, save often. We periodically autosave for you.',
      loc: "top center, bottom center",
      nextButton: true,
      url: '/editor/0/',
      setup: function(tour, options) {
        $('#item-gallery').animate({
          scrollTop: $("#type-headerTexts").offset().top - 110
        }, 200);
        v1.save();
        return { target: $('#editor-save') };
      }
    },
    /*
     * Drag header element
     */
    {
      ind     : 8,
      title   : 'Drag\'n\'Drop',
      content : '<em>Drag this header element to the page.</em>',
      loc     : "right center, left center",
      url: '/editor/0/',
      setup: function(tour, options) {

        headerDragged = function(uielem) {
          if(uielem.get('data').get('tagName') == "h1") {
            tour.next();
          }
        };
        v1State.getCurrentPage().get('uielements').bind('add', headerDragged);

        return { target: $('#type-headerTexts') };
      },
      teardown: function() {
        v1State.getCurrentPage().get('uielements').unbind('add', headerDragged);
      }
    },
    /*
     * Editing Elements
     */
    {
      ind     : 9,
      title   : 'Editing Elements',
      content : 'Click the text to edit it.<br>Then, click "Pick Style" to choose your style.',
      loc: "left center, right center",
      nextButton: true,
      url: '/editor/0/',
      setup: function(tour, options) {
        console.log(v1);
        console.log(v1.view);
        v1.view.galleryEditor.expandAllSections();
        $('#item-gallery').animate({
          scrollTop: $("#entity-user-facebook").offset().top - 110
        }, 200);

        return { target: $('.pick-style') };
      }
    },
    /*
     * Drag facebook login
     */
    {
      ind     : 10,
      title   : 'Time to get some users!',
      content : '<em>Drag this facebook login button onto the page.</em>',
      loc     : "right center, left center",
      url     : '/editor/0/',
      target  : $('#entity-user-facebook'),
      waitUntil: "#entity-user-facebook",
      prepare : function() {
        $('#item-gallery').scrollTop($("#entity-user-facebook").offset().top - 110);
      },
      setup: function(tour, options) {
        facebookDropped = function(uielem) {
          if(uielem.get('data').get('action') == "thirdpartylogin") {
            tour.loginButton = uielem;
            tour.next();
          }
        };
        v1State.get('pages').models[0].get('uielements').bind('add', facebookDropped);

        return { target: function() {
          return ;
        }() };
      },
      teardown: function() {
        v1State.getCurrentPage().get('uielements').unbind('add', facebookDropped);
      }
    },
    /*
     * Customize facebook login btn
     */
    {
      ind     : 11,
      title   : 'Customizing functionality',
      content : 'Some elements, like this Facebook button, can be customized.</p><p><em>Select it and click <strong>Edit Login</strong></em>',
      loc     : "left center, right center",
      url: '/editor/0/',
      setup: function(tour, options) {
        var elem = $(".facebook-login-btn")[0];
        $('.edit-login-form-btn').first().on('click', function() {
              // setTimeout(tour.next, 400);
              waitUntilAppears('.login-route-editor', tour.next);
            });
        return { target: $(elem) };
      }
    },
    /*
     * change action after login
     */
    {
      ind     : 12,
      title   : 'Customizing functionality',
      content : 'Here, you can select where the user goes after login. Please change it to the "Tweet Feed" page.</em>',
      loc     : "right center, left center",
      url: '/editor/0/',
      setup: function(tour, options) {
        tour.loginButton.get('data').get('loginRoutes').models[0].bind('change', tour.next);
        return { target: $('.login-route-editor') };
      },
      teardown: function(tour, options) {
        tour.loginButton.get('data').get('loginRoutes').models[0].unbind('change', tour.next);
        $('.modal-bg').remove();
        $('.login-route-editor.modal').remove();
      }
    },
    /*
     * Change to Tweet Feed Page
     */
    {
      ind     : 13,
      title   : 'On to the next page!',
      content : 'Hover over "Homepage" to see your pages and easily navigate to "Tweet Feed" by clicking on it.</em>',
      // TODO make the gradients more noticable
      loc     : "left top, right center",
      url: '/editor/0/',
      setup: function(tour, options) {
        v1.bind('editor-loaded', function() {
          tour.next();
        });

        return {target:  $('.menu-button.pages')};
      },
      teardown: function() {
        v1.unbind('editor-loaded');
      }
    },
    /*
     * Tweet feed page
     */
    {
      ind     : 14,
      title   : 'Tweet Feed Page',
      content : 'On this page, we will a “Create Form" and put a Twitter feed. Let\'s start with the form first.',
      loc     : "top center, bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {
        return { target: $('.menu-button.pages') };
      }
    },
    /*
     * Add Tweet Create form
     */
    {
      ind     : 15,
      title   : 'Create Form',
      content : '<em>Drag this form on to the left side of the page.</em>',
      loc     : "right center, left center",
      url: '/editor/1/',
      setup: function(tour, options) {

        checkForNewOption = function() {
          waitUntilAppears('#new-option', tour.next);
        };

        v1State.getCurrentPage().bind('creat-form-dropped', checkForNewOption);

        return { target: $('#type-create-form') };
      },
      teardown: function() {
        v1State.getCurrentPage().unbind('creat-form-dropped', checkForNewOption);
      }
    },
    /*
     *
     */
    {
      ind     : 16,
      title   : 'What to create?',
      content : '<em>Select <strong>Add a new entity</strong>, and enter <strong>Tweet</strong></em>',
      loc     : "right center, left center",
      url     : '/editor/1/',
      setup: function(tour, options) {
        tweetTableCreated = function(table) {
          if(table.get('name') == "Tweet") {
            tour.tweetTable = table;
            waitUntilAppears('.form-editor-btn', tour.next);
          }
          else {
            alert('Name of the table should be "Tweet"');
            table.remove();
          }
        };
        v1State.get('tables').bind('add', tweetTableCreated);
        return { target: $('#new-option') };
      },
      teardown: function() {
        v1State.get('tables').bind('add', tweetTableCreated);
      }
    },
    {
      ind     : 17,
      title   : 'Editing the Form',
      content : 'We have this blank form now and we need to add some fields to it. Click on <em>Edit Form</em> button.',
      loc     : "top center, bottom center",
      url     : '/editor/1/',
      setup: function(tour, options) {
        $('.form-editor-btn').first().one('click', function() {
          // setTimeout(tour.next, 400);
          waitUntilAppears('.form-editor-title', tour.next);
        });
        return { target: $('.form-editor-btn') };
      }
    },
    {
      ind     : 18,
      title   : 'Form Editor',
      content : 'Form editor let\'s you edit your forms and add new fields to it.',
      loc     : "left top, right top",
      url     : '/editor/1/',
      nextButton: true,
      setup: function(tour, options) {
        return { target: $('.form-editor-title') };
      }
    },
    {
      ind     : 19,
      title   : 'Add a New Field',
      content : 'Create a new form field by clicking on <em>Add a New Field</em> button.',
      loc     : "bottom center, top center",
      url     : '/editor/1/',
      setup: function(tour, options) {
        $('.btn.add-field-button').one('click', function() {
          waitUntilAppears('#option-0', tour.next);
        });
        return { target: $('.btn.add-field-button') };
      }
    },
    {
      ind     : 20,
      title   : 'Creating a Form Field',
      content : 'Since we don\'t have and fields defined before, we should create a new one. Click on <em>Create A New Field</em>',
      loc     : "top left, bottom left",
      url     : '/editor/1/',
      setup: function(tour, options) {
        $('#option-0').one('change', function() {
          waitUntilAppears('.new-field-form', tour.next);
        });
        return { target: $('#option-0') };
      }
    },
    {
      ind     : 21,
      title   : 'We want to Save Some Text',
      content : 'We want to save the text content of a tweet here, so we can just name the field as "Content" and click <em>Done</em>',
      loc     : "left top, right top",
      url     : '/editor/1/',
      setup: function(tour, options) {
        $('.new-field-form').one('submit', tour.next);
        return { target: $('.new-field-form') };
      }
    },
    {
      ind     : 22,
      title   : 'We have an awesome form now',
      content : 'We\'re basically done with our form, but you can customize it further, change the label to "Tweet" etc. When you\'re done click on <em>Done</em> to coninue.',
      loc     : "bottom right, top right",
      url     : '/editor/1/',
      setup: function(tour, options) {
        $('#item-gallery').animate({
          scrollTop: $(".entity-list").offset().top - 90
        }, 200);
        $('.btn.done').one('click', tour.next);
        return { target: $('.btn.done')};
      }
    },
    /*
     * Creating a List
     */
    {
      ind     : 23,
      title   : 'Twitter Feed',
      content : '<em>Drag a <strong>Tweet List</strong> onto the page.</em>',
      loc     : "right center, left center",
      url     : '/editor/1/',
      setup: function(tour, options) {
        draggedTweetList = function(uielem) {
          if(uielem.get('type') == "loop") {
            tour.pageLoop = uielem;
            waitUntilAppears('.edit-row-btn', tour.next);
          }
        };
        v1State.getCurrentPage().get('uielements').bind('add', draggedTweetList);
        return { target: $('.entity-list') };
      },
      teardown: function() {
        v1State.getCurrentPage().get('uielements').unbind('add', draggedTweetList);
      }
    },
    {
      ind     : 24,
      title   : 'About this "list"',
      content : '"Edit Row" allows you to edit each row\'s appearance and content.<br>"Edit Query" allows you to filter and sort the Tweets.</p><p><em>Click on "Edit Row"</em>',
      loc     : "top center, bottom center",
      url     : '/editor/1/',
      setup: function(tour, options) {

        $('.edit-row-btn').one('click', function() {
          setTimeout(function() {
            tour.next();
          }, 300);
        });

        return { target: $('#widget-editor') };
      }
    },
    {
      ind     : 25,
      title   : 'The Green Row',
      content : 'The green area of the list represents a single row. Drag\'N\'Drop works here too.',
      loc     : "top center, bottom center",
      url     : '/editor/1/',
      nextButton: true,
      setup: function(tour, options) {

        return { target: $('.highlighted').first() };
      }
    },
    {
      ind     : 26,
      title   : 'Editing Row Content',
      content : '<em>Drag a header element into the green row.</em>',
      loc     : "bottom center, top center",
      url     : '/editor/1/',
      nextButton: true,
      setup: function(tour, options) {

        $('#item-gallery').scrollTop(0);
        $('#item-gallery').animate({
          scrollTop: $(".entity-create-form").offset().top - 90
        }, 200);

        tweetStuffDragged = function() {
          tour.next();
        };

        tour.pageLoop.get('data').get('container_info').get('row').get('uielements').bind('add', tweetStuffDragged);
        return { target: $('.row-elements-list') };
      },
      teardown: function(tour, options) {
        tour.pageLoop.get('data').get('container_info').get('row').get('uielements').unbind('add', tweetStuffDragged);
      }
    },
    {
      // TODO see how this looks and make shorter if necessary
      ind     : 27,
      title   : 'Cool!',
      content : 'You successfully made a Twitter feed. You can make things look a little nicer if you want: resize things in the row, pick styles for the elements.</p><p><em>When done, Click "Done Editing" to switch off editing mode.</em>',
      loc     : "right center, left center",
      url     : '/editor/1/',
      setup: function(tour, options) {
        tour.pageLoop.bind('deselected', function() {
          tour.next();
        });
        $('.done-editing').one('click', function() {
          tour.next();
        });
        return { target: $('.done-editing') };
      },
      teardown: function(tour, options) {
        tour.pageLoop.unbind('deselected');
      }
    },
    // TODO associate the Tweet with the user in the modal
    {
      ind     : 28,
      title   : 'Almost there!',
      content : 'Press "Test Run" and you will see your site up and running!',
      loc     : "top center, bottom center",
      nextButton: true,
      url: '/editor/1/',
      setup: function(tour, options) {
        return { target: $('.save-run-group') };
      },
      teardown: function() {
        //last step done, delete walkthrough attribute
        delete v1State.attributes.simpleWalkthrough;
        util.log_to_server('finished simple twitter walkthrough', {}, appId);
      }
    }
    ];

    var ind = v1State.get('simpleWalkthrough') - 1;
    var currentSteps = steps.slice(ind);


    var quickTour = new TouristOmer.Tour({
      steps     : currentSteps,
      onEachStep: function(step) {
        console.log(step);
        v1State.set('simpleWalkthrough', step.ind);
        util.log_to_server('simple twitter walkthrough step', { step: v1State.attributes.simpleWalkthrough}, appId);
      }
    });

    quickTour.currentStep = currentSteps[0];

    return quickTour;
  });
