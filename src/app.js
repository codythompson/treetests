(function (scope) {

var App = function () {
  this.views = {};
  this.templates = {};
};
App.prototype = {
  add_view: function (view_name, view_constructor) {
    this.views[view_name] = view_constructor;
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

  get_view: function (view_name) {
    if (!this.views[view_name]) {
      throw '[treetests] view "' + view_name + '" not found.';
    }

    return this.views[view_name];
  },

  get_view_from_template: function (template) {
    if (!template.view) {
      throw '[treetests] template not root, no view name found';
    }
    return this.get_view(template.view);
  },

  get_template: function (template_name) {
    if (!this.templates[template_name]) {
      throw '[treetests] template "' + template_name + '" not found.';
    }

    return this.templates[template_name];
  },

  inject: function (template_name, test_data, parent_ele) {
    var template = this.get_template(template_name);
    var view = this.get_view_from_template(template);
    view = new view(test_data, template);
    treetests.build_dom(parent_ele || document.body, template, test_data, view);
  }
};
scope.treetests.app = function () {
  return new App();
};

})(this);
