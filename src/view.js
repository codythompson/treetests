(function (scope) {

/*
 * this should be passed 3 arguments!
 * test_data, controller, AND a string script to eval
 *
 * optionally, you can pass a 4th argument that is the expected resulting type
 */
var att_script_eval = function (model, controller) {
  var att_val;
  try {
    att_val = eval(arguments[2]);
  } catch (e) {
    // TODO something better than this
    throw '[treetests] invalid tt-att value: "' + arguments[2] + '"';
  }

  if (arguments.length >= 4 && typeof att_val !== arguments[3]) {
    throw '[treetests] invalid tt-att value type: "' + typeof att_val + '", expected: "' + arguments[3] + ' "';
  }
  if (arguments.length >= 4) {
    var exp_types = arguments[3];
    if (!Array.isArray(arguments[3])) {
      exp_types = [exp_types];
    }
    var found_type = false;
    for (var i = 0; i < exp_types.length; i++) {
      if (typeof att_val === exp_types[i]) {
        found_type = true;
        break;
      }
    }
    if (!found_type) {
      throw '[treetests] invalid tt-att value type: "' + typeof att_val + '", expected: "' + arguments[3] + ' "';
    }
  }

  return att_val;
};


var ViewScope = function (app, template, controller, model) {
  this.app = app;
  this.template = template;

  this.controller = controller || null;
  this.model = model || null;

  this.ele_tree = this.build_ele_tree(this.template);
};
ViewScope.prototype = {
  tt_att_handlers: {
    // TODO \/
    'data-tt-class': function (ele, att_val, test_data, controller) {
      att_val = att_script_eval(test_data, controller, att_val, 'string');
      ele.add_class(att_val);
    },
    'data-tt-text': function (ele, att_val, test_data, controller) {
      att_val = att_script_eval(test_data, controller, att_val) + '';
      ele.children.push(att_val);
    },
    'data-tt-skip': function (ele, att_val, test_data, controller) {
      att_val = att_script_eval(test_data, controller, att_val);
      if (att_val) {
        ele.skip = true;
      }
    }
  },

  set_controller(template) {
    if (template.controller) {
      this.controller = new (this.app.get_controller(template.controller))();
    }
  },

  set_model(template) {
    if (template.model) {
      this.model = att_script_eval(this.model, this.controller, template.model);
    }
    if (this.controller && this.controller.set_model) {
      this.controller.set_model(this.model);
    }
  },

  build_ele: function (template) {
    this.set_controller(template);
    this.set_model(template);

    var ele = new treetests.DomEle(template);
    for (var tt_att in template.tt_atts) {
      var handler = this.tt_att_handlers[tt_att];
      var att_val = template.tt_atts[tt_att];
      if (handler) {
        handler.call(this, ele, att_val, this.model, this.controller);
      }
    }

    for (var i = 0; !ele.skip && i < template.children.length; i++) {
      var child = template.children[i];
      ele.children.push(this.build_ele_tree(child));
    }

    return ele;
  },

  build_tt_ele: function (template) {
    var new_template = app.get_template(template.tag).clone();
    new_template.transfer_state(template);

    var view = new ViewScope(app, new_template, this.controller, this.model);
    return view.ele_tree;
  },

  build_tt_repeater: function (template) {
    // build the containing html element
    var parent_template = template.clone();
    delete parent_template.controller;
    delete parent_template.model;
    parent_template.children = [];
    parent_template.tag = 'div';
    var parent_ele = this.build_ele(parent_template);

    if (!template.model) {
      var ele = new treetests.DomEle(template);
      ele.skip = true;
      return ele;
    }
    var models = att_script_eval(this.model, this.controller, template.model);
    var controller_class = (template.controller && this.app.get_controller(template.controller)) || null;

    // if we have an array of models, iterate
    for (var i = 0; Array.isArray(models) && i < models.length; i++) {
      var model = models[i];
      var controller = this.controller;
      if (controller_class) {
        controller = new controller_class();
        controller.set_model(model);
      }
      if (controller.set_repeat_number) {
        controller.set_repeat_number(i);
      }
      for (var j = 0; j < template.children.length; j++) {
        var child_template = template.children[j].clone();
        var view = new ViewScope(this.app, child_template, controller, model);
        parent_ele.children.push(view.ele_tree);
      }
    }

    // TODO handle an object filled with models in addition to arrays

    return parent_ele;
  },

  build_ele_tree: function (template) {
    switch (template.type) {
      case 'text':
        return template.value;
      case 'ele':
        return this.build_ele(template);
      case 'tt-repeater':
        return this.build_tt_repeater(template);
      case 'tt-ele':
        return this.build_tt_ele(template);
    }
  },
};

scope.treetests.ViewScope = ViewScope;

})(this);
