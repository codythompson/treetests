(function (scope) {

var App = function () {
  this.controllers = {};
  this.templates = {};
};
App.prototype = {
  add_controller: function (controller_name, controller_constructor) {
    this.controllers[controller_name] = controller_constructor;
  },

  add_template: function (template_name, ele_or_id) {
    if (typeof ele_or_id === 'string') {
      ele_or_id = document.getElementById(ele_or_id);
    } else if (typeof ele_or_id !== 'object') {
      return; // we don't know what to do with it
    }

    var template = treetests.templatize(ele_or_id);
    template.app = this;
    this.templates[template_name] = template;
  },

  get_controller: function (controller_name) {
    if (!this.controllers[controller_name]) {
      throw '[treetests] controller "' + controller_name + '" not found.';
    }

    return this.controllers[controller_name];
  },

  get_template: function (template_name) {
    if (!this.templates[template_name]) {
      throw '[treetests] template "' + template_name + '" not found.';
    }

    return this.templates[template_name];
  },

  inject: function (template_name, parent_ele, model, controller) {
    if (typeof controller === 'function') {
      controller = new controller();
    }
    var template = this.get_template(template_name);
    var viewscope = new treetests.app.ViewScope(this, template, controller, model);
    var ele = viewscope.ele_tree.build();
    (parent_ele || document.body).appendChild(ele);
  }
};
scope.treetests.app = function () {
  return new App();
};

})(this);
