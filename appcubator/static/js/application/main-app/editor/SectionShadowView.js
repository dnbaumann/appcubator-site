define(function(require, exports, module) {

    'use strict';

    var WidgetView = require('editor/WidgetView');
    var WidgetModel = require('models/WidgetModel');
    var SectionEditorView = require('editor/SectionEditorView');

    require('backbone');
    require('util');


    var SectionShadowView = Backbone.View.extend({

        widgetsContainer: null,

        events: {
            'mouseover'       : 'hovered',
            'mouseup'         : 'hovered',
            'mouseover .ycol' : 'hoveredColumn',
            'mouseup .ycol'   : 'hoveredColumn'
        },

        className: "section-shadow-view",

        subviews: [],

        initialize: function(sectionCollection) {
            _.bindAll(this);

            this.collection = sectionCollection;
            this.listenToModels(sectionCollection, 'change', this.reRenderSectionShadow);
        },

        render: function() {

            this.shadowFrame = document.getElementById('shadow-frame');
            var iframe = v1.currentApp.view.iframe;
            this.iframe = iframe;
            this.iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            this.shadows = [];

            return this;
        },

        renderSectionShadow: function(sectionModel) {

            var $el = $(this.iframeDoc).find('[data-cid="' + sectionModel.cid + '"]');
            var ycols = $el.find('[data-column]');

            var self = this;

            ycols.each(function() {
                var colCid = this.dataset.cid;
                var shadowEl = util.addShadow(this, document.getElementById('page-wrapper'), self.iframe, self.iframeDoc);
                //shadowEl.innerHTML = sectionModel.cid;
                shadowEl.className = "section-shadow";
                self.shadows.push(shadowEl);
                self.shadowFrame.appendChild(shadowEl);

                $(shadowEl).droppable({
                    accept: ".ui-draggable",
                    drop: function( event, ui ) {

                        var extraData = {};

                        var type = $(ui.draggable).data("type");

                        if($(ui.draggable).data("extraData")) {
                            extraData = $(ui.draggable).data("extraData");
                        }

                        if($(ui.draggable).data("genpath")) {
                            sectionModel.get('columns').get(colCid).addElementWithPath(type, $(ui.draggable).data("genpath"), extraData);
                            return;
                        }

                        // var idshit =
                        sectionModel.get('columns').get(colCid).addElement(type, extraData);
                    },
                    over: function() {
                        shadowEl.className = "section-shadow active";
                    },
                    out: function() {
                        shadowEl.className = "section-shadow";
                    }
                });
            });

        },

        displayColumnShadows: function() {
            this.collection.each(this.renderSectionShadow);
            $(this.shadowFrame).show();
        },

        hideColumnShadows: function() {
            $(this.shadowFrame).hide();
            _.each(this.shadows, function(shadowEl) {
                $(shadowEl).remove();
            });

            this.shadows = [];
        }

    });

    return SectionShadowView;
});
