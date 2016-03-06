var RequireRuntime = (function() {
  "use strict";
  RequireRuntime.later = function() {
    this.callbacks = [];
    this.errors = [];
    this.cerror = null;
    this.cdata = null;
    this.then = function(callback, errorCallback) {
      if (this.cdata) {
        this.cdata = callback(this.cdata);
      } else if (this.cerror && errorCallback) {
        errorCallback(this.ccerror)
      } else {
        if (this.callbacks && callback)    this.callbacks.push(callback);
        if (this.errors && errorCallback)  this.errors.push(errorCallback);
        if (this.cdata) {
          this.cdata = callback(this.cdata);
        } else if (this.cerror && errorCallback) {
          errorCallback(this.ccerror)
        }
      }
      return this;
    }
    this.call = function(data, array, target) {
      this[target] = data;
      for (var i in this[array]) {
        var return_value = this[array][i](this[target]);
        if (return_value) this[target] = return_value;
      }
      this.callbacks = null;
      this.errors = null;
    }
    this.resolve = function(data) {
      if (this.cdata || this.cerror) return;
      this.call(data, "callbacks", "cdata");
    }
    this.reject = function(data) {
      if (this.cdata || this.cerror) return;
      console.warn("Defer was rejected: "+data)
      this.call(data, "errors", "cerror");
    }
  }

  function RequireRuntime(){}
  RequireRuntime.module_defines = {};
  RequireRuntime.modules = {};
  RequireRuntime.file_registry = {};

  RequireRuntime.dependencies_resolved = function(dependencies) {
    for (var i in dependencies) {
      if (RequireRuntime.modules[dependencies[i]] == undefined || RequireRuntime.modules[dependencies[i]].then){
        return false;
      }
    }
    return true;
  }
  RequireRuntime.instantiateBlock = function(block, dependencies) {
    if (RequireRuntime.dependencies_resolved(dependencies)) {
      block.apply(0, RequireRuntime.mapDependencies(dependencies));
    }
  }
  RequireRuntime.instantiateModule = function(name, dependencies, defer) {
    if (RequireRuntime.dependencies_resolved(dependencies)) {
      RequireRuntime.modules[name] = RequireRuntime.module_defines[name].module.apply(0, RequireRuntime.mapDependencies(dependencies)) || {};
      defer.resolve(RequireRuntime.modules[name]);
    }
  }
  RequireRuntime.mapDependencies = function(dependencies) {
    return dependencies.map(function(dependency) {
      return RequireRuntime.modules[dependency];
    });
  }
  RequireRuntime.createModule = function(name) {
    var defer = new RequireRuntime.later();
    if (!RequireRuntime.module_defines[name]) {
      RequireRuntime.modules[name] = {};
      defer.resolve({});
      return defer;
    }
    RequireRuntime.modules[name] = defer;
    if (RequireRuntime.module_defines[name].dependencies.length > 0) {
      for (var d in RequireRuntime.module_defines[name].dependencies) {
        var dependency = RequireRuntime.module_defines[name].dependencies[d];
        RequireRuntime.resolve(dependency).then(function(module) {
          RequireRuntime.instantiateModule(name, RequireRuntime.module_defines[name].dependencies, defer);
        });
      }
    } else {
      RequireRuntime.instantiateModule(name, [], defer);
    }
    return defer;
  }
  RequireRuntime.resolve = function(module_name) {
    var defer = new RequireRuntime.later();
    if (RequireRuntime.modules[module_name]) {
      if (RequireRuntime.modules[module_name] instanceof RequireRuntime.later) {
        RequireRuntime.modules[module_name].then(function(mod) {
          defer.resolve(mod);
        });
      } else
        defer.resolve(RequireRuntime.modules[module_name]);
    } else if(RequireRuntime.module_defines[module_name]) {
      RequireRuntime.createModule(module_name).then(function(module) {
        defer.resolve(module);
      });
    } else if (RequireRuntime.file_registry[module_name+".js"]) {
      return RequireRuntime.file_registry[module_name+".js"];
    } else {
      RequireRuntime.file_registry[module_name+".js"] = defer;
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.src = module_name+".js";
      script.addEventListener("load", function() {
        console.log("loaded file ("+module_name+")");
        RequireRuntime.createModule(module_name).then(function(module) {
          defer.resolve(module);
        });
      });
      script.addEventListener("error", function() {
        console.log("loaded file ("+module_name+")");
        defer.resolve(module_name);
      });
      head.appendChild(script);
    }
    return defer;
  }
  RequireRuntime.require = function(dependencies, block) {
    if (dependencies instanceof Array) {
      for (var i in dependencies){
        RequireRuntime.resolve(dependencies[i]).then(function() {
          RequireRuntime.instantiateBlock(block, dependencies)
        });
      }
    } else
      RequireRuntime.resolve(dependencies).then(block);
  }
  RequireRuntime.define = function(module_name, module) {
    var dependencies = [];
    var new_module = null;
    if (module instanceof Array) {
      for (var i in module) {
        if (i < module.length-1)
          dependencies.push(module[i]);
        else
          new_module = module[i];
      }
    } else {
      new_module = module;
    }
    RequireRuntime.module_defines[module_name] = {
      dependencies: dependencies,
      module: new_module
    };
  }
  return RequireRuntime;
})();
var require = RequireRuntime.require;
var define = RequireRuntime.define;
