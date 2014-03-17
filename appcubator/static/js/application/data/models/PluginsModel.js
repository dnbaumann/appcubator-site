define(function(require, exports, module) {

    'use strict';

    require('backbone');
    var PluginModel = require('models/PluginModel');
    var NodeModelMethodModel = require('models/NodeModelMethodModel');

    /* Contains metadata and convenience methods for Plugins */
    var PluginsModel = Backbone.Model.extend({

        initialize: function(bone) {

            _.each(bone, function(val, key) {
                var pluginModel = new PluginModel(val);
                this.set(key, pluginModel);
            }, this);

        },

        /* builtin plugins are not in the model by default,
         * so this fn includes them in its return value 
         * 
         * returns { pluginName1: plugingModel1, ... } */
        getAllPlugins: function() {

            var plugins = {};
            plugins = _.extend(plugins, _.clone(this.attributes)); // pluginName : pluginModel object

            /* Start with local plugins and merge builtin plugins in, not overwriting local plugins. */

            _.each(G.expander.builtinGenerators, function(builtInPlugin, pluginName) {
                var pluginModel = new PluginModel(builtInPlugin);

                if (!plugins[pluginName]) {
                    plugins[pluginName] = pluginModel;
                } else {
                    /* User might have forked a generator from a builtin plugin */
                    var localCopy = new PluginModel();

                    // app-state copy of the package 
                    _.each(plugins[pluginName].attributes, function(val, key) {
                        localCopy.set(key, _.clone(val));
                    }); 

                    // iterating over the builtin ones and mergins the gens
                    _.each(builtInPlugin, function(gens, moduleName) {
                        if (moduleName === 'metadata')
                            return;
                        if(!localCopy.has(moduleName)) {
                            localCopy.set(moduleName, gens);
                        } else {
                            localCopy.set(moduleName, _.union(localCopy.get(moduleName), gens));
                        }
                    });

                    plugins[pluginName] = localCopy;
                }
            });

            return plugins;
        },

        getAllPluginsSerialized: function() {
            var plugins = this.getAllPlugins();
            var serializedPlugins = {};

            _.each(plugins, function(val, key) {
                serializedPlugins[key] = val.serialize();
            });

            return util.deepCopy(serializedPlugins);
        },

        install: function(plugin) {
            if (!plugin.metadata || !plugin.metadata.name)
                alert('not installing because this plugin doesn\'t have metadata.');
            var pluginModel = new PluginModel(plugin);
            this.set(plugin.metadata.name, pluginModel);
        },

        uninstall: function(pluginName) {
            this.unset(pluginName);
            // TODO do something about generator references to this plugin?
        },

        getPluginsWithModule: function(moduleName) {
            return _.filter(this.attributes, function(pluginModel, pluginName) {
                pluginModel.name = pluginName;
                return pluginModel.has(moduleName);
            });
        },

        getAllPluginsWithModule: function(moduleName) {
            var plugins = this.getAllPlugins();
            return _.filter(plugins, function(pluginModel) {
                // pluginModel.name = pluginName;
                return pluginModel.has(moduleName);
            });
        },

        getGeneratorsWithModule: function(generatorModule) {
            var generators = [];

            var generators = _.flatten(_.map(this.attributes, function(pluginModel, packageName) {
                return pluginModel.getGensByModule(generatorModule);
            }));

            return generators;
        },

        getAllGeneratorsWithModule: function(moduleName) {
            var plugins = this.getAllPluginsWithModule(moduleName);
            var plugins = _.filter(plugins, function(pluginModel, key) {
                return pluginModel.has(moduleName);
            });

            var generators = _.flatten(_.map(plugins, function(pluginModel) {
                var gens = pluginModel.get(moduleName);
                _.each(gens, function(gen) { gen.package = pluginModel.getName(); });
                return gens;
            }));

            return generators;
        },

        isPluginInstalledToModel: function(pluginModel, nodeModelModel) {
            var gens = pluginModel.getGensByModule('model_methods');
            var genNames = _.map(gens, function(g) { return pluginModel.getName() + '.model_methods.' + g.name; });
            var functions = nodeModelModel.get('functions').map(function(fn) { return fn.generate; });
            return _.intersection(genNames, functions).length > 0 ? true : false;
        },

        installPluginToModel: function(pluginModel, nodeModelModel) {
            if (!pluginModel) return;
            var pluginName = pluginModel.getName();
            
            if(this.has(pluginName)) {
                var gens = this.get(pluginName).getGensByModule('model_methods');
            }
            else if (this.getAllPlugins()[pluginName]) {
                var gens = this.getAllPlugins()[pluginName].getGensByModule('model_methods');
            }
            else {
                throw "Plugin to install could not be found.";
            }

            _.each(gens, function(gen) {
                var methodModel = new NodeModelMethodModel();
                var genIDStr = pluginModel.getName() + '.model_methods.' + gen.name;
                methodModel.setGenerator(genIDStr);
                methodModel.set('modelName', nodeModelModel.get('name'));
                methodModel.set('name', gen.name);
                nodeModelModel.get('functions').push(methodModel);
            });
        },

        uninstallPluginToModel: function(plugin, nodeModelModel) {
            var gens = [];

            nodeModelModel.get('functions').each(function(fn) {
                if(fn.isInPackage(plugin.getName())) {
                    gens.push(fn);
                }
            });

            nodeModelModel.get('functions').remove(gens);
        },

        fork: function (generatorPath, newName) {
            var generator = G.getGenerator(generatorPath);
            var genObj = _.clone(generator);

            var newPath = util.packageModuleName(generatorPath);
            newPath.name = newName;
            genObj.name = newName;

            if (!this.has(newPath.package)) {
                // NOTE this only happens when builtin generator is forked
                this.set(newPath.package, new PluginModel({metadata: {name: newPath.package}}));
            }

            if (!this.get(newPath.package).has(newPath.module)) {
                // NOTE this only happens when builtin generator is forked
                this.get(newPath.package).set(newPath.module, []);
            }

            this.get(newPath.package).get(newPath.module).push(genObj);

            return [newPath.package, newPath.module, newPath.name].join('.');
        },

        isGeneratorEditable: function(generatorPath) {
            var newPath = util.packageModuleName(generatorPath);
            if (!this.has(newPath.package)) { return false; }
            if (!this.get(newPath.package).has(newPath.module)) { return false; }

            var isEditable = true;
            _.each(this.get(newPath.package).has(newPath.module), function(gen) {
                if(gen.name == newPath.name) { isEditable = false; }
            });

            return isEditable;
        },

        isNameUnique: function(newPackageModuleName) {
            // TODO FIXME
            // 1. this doesn't include builtins
            // 2. shouldn't you do a has check before doing get?

            var plugin = this.get(newPackageModuleName.package);
            if (!plugin) return true;

            var module = plugin.get(newPackageModuleName.module);
            if (!module) return true;

            if (module[newPackageModuleName.name]) {
                return false;
            }

            return true;
        },

        toJSON: function() {
            var json = _.clone(this.attributes);

            _.each(json, function (val, key) {
                json[key] = val.serialize();
            });

            return json;
        }

    });

    return PluginsModel;
});
