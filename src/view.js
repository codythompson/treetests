(function (scope) {

var ViewScope = function (app, template, controller, model) {
  this.app = app;
  this.template = template;

  this.controller = controller || null;
  this.model = model || null;

  this.ele_tree = this.build_ele_tree(this.template);
};
ViewScope.prototype = {
  /*
   * this should be passed 3 arguments!
   * test_data, controller, AND a string script to eval
   *
   * optionally, you can pass a 4th argument that is the expected resulting type
   */
  att_script_eval: function (model, controller) {
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

    return att_val;
  },

  tt_att_handlers: {
    // TODO \/
    'data-tt-class': function (ele, att_val, test_data, controller) {
      att_val = this.att_script_eval(test_data, controller, att_val, 'string');
      ele.add_class(att_val);
    },
    'data-tt-text': function (ele, att_val, test_data, controller) {
      att_val = this.att_script_eval(test_data, controller, att_val) + '';
      ele.children.push(att_val);
    },
    'data-tt-skip': function (ele, att_val, test_data, controller) {
      att_val = this.att_script_eval(test_data, controller, att_val);
      if (att_val) {
        ele.skip = true;
      }
    },
    'data-tt-repeat': function (ele, att_val, test_data, controller) {
      ele.skip = true;
      // att_val = this.att_script_eval(test_data, controller, att_val, 'object');
      // if (Array.isArray(att_val) {
      //   for (var i = 0; i < att_val.length; i++) {
      //     var child_model = att_val[i];
      //   }
      // }
    },
  },

  set_controller(template) {
    if (template.controller) {
      this.controller = new (this.app.get_controller(template.controller))();
    }
  },

  set_model(template) {
    if (template.model) {
      this.model = this.att_script_eval(this.model, this.controller, template.model);
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
    if (template.controller) {
      new_template.controller = template.controller;
    }
    // TODO template.model tt-data-model
    var view = new ViewScope(app, new_template, this.controller, this.model);
    return view.ele_tree;
  },

  build_ele_tree: function (template) {
    switch (template.type) {
      case 'text':
        return template.value;
      case 'ele':
        return this.build_ele(template);
      case 'tt-ele':
        return this.build_tt_ele(template);
    }
  },
};

scope.treetests.ViewScope = ViewScope;

})(this);
