define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Generator = function() {

    };

    Generator.prototype.generate = function(generatorPath, data) {

        var Vm = function() {

            this.runCode = function(code, globals) {
                var templates = globals.templates;
                var expand = globals.expand;
                return eval(code);
            };

        };

        var VM = new Vm();
        window.expander = expanderfactory(function(code, globals) {
            return VM.runCode(code, globals);
        });

        return expander.expand(appState.generators, {generate: generatorPath, data: data});
    };

    return Generator;

});