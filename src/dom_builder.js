(function (scope) {

/*******************************************************************************
 * dom_builder
*******************************************************************************/
var dom_builder = {
  templates: {},

  /*
   * this should be passed 3 arguments!
   * test_data, view, AND a string script to eval
   */
  att_script_eval: function (test_data, view) {
    try {
      return eval(arguments[2]);
    } catch (e) {
      // TODO something better than this
      throw '[treetests] invalid tt-att value: "' + arguments[2] + '"';
    }
  },

  att_handlers: {
    'data-tt-class': function (att_val, template_ele, test_data, view) {
      var class_val = template_ele.atts['class'];
      if (class_val && class_val.length > 0) {
        class_val += ' ';
      } else {
        class_val = '';
      }
      var script_val = dom_builder.att_script_eval(test_data, view, att_val);
      if (typeof script_val !== 'string') {
        // TODO something better than this
        throw '[treetests] invalid tt-class value: "' + arguments[2] + '", must evaluate to string';
      } else if (script_val.length === 0) {
        return {};
      }

      return {
        atts: {
          'class': class_val + script_val
        }
      };
    },

    'data-tt-text': function (att_val, template_ele, test_data, view) {
      var script_val = dom_builder.att_script_eval(test_data, view, att_val) + '';
      if (typeof script_val !== 'string') {
        // TODO something better than this
        throw '[treetests] invalid tt-text value: "' + arguments[2] + '", must evaluate to string';
      }

      return {
        children: [
          {
            type: 'text',
            value: script_val
          }
        ]
      };
    },

    'data-tt-skip': function (att_val, template_ele, test_data, view) {
      var script_val = dom_builder.att_script_eval(test_data, view, att_val);
      if (script_val) {
        return null;
      } else  {
        return {};
      }
    },

    'data-tt-repeat': function (att_val, test_data, view) {
      var att_tokens = att_val.split(' in ');
      // TODO move validation to where the template gets read
      if (att_tokens.length !== 2) {
        throw '[treetests] invalid tt-att syntax: "' + att_val + '"';
      }

      // strip extra whitespace
      att_tokens[0] = att_tokens[0].replace(' ', '');
      att_tokens[1] = att_tokens[1].replace(' ', '');

      return {
        children: [], // TODO
        replace_children: true
      };
    },
  },

  update_atts: function (template, new_vals) {
    if (!new_vals.atts) {
      return;
    }
    for (var att_key in new_vals.atts) {
      template.atts[att_key] = new_vals.atts[att_key];
    }
  },

  update_children: function (template, new_vals) {
    if (!new_vals.children) {
      return;
    } else if (new_vals.replace_children) {
      template.children = new_vals.children;
    } else {
      template.children = template.children.concat(new_vals.children);
    }
  },

  node_handlers: {
    'text': function (template) {
      return document.createTextNode(template.value);
    },

    'ele': function (template, test_data, view) {
      for (var att_name in template.tt_atts) {
        var handler = dom_builder.att_handlers[att_name];
        if (handler) {
          var new_vals = handler(template.tt_atts[att_name], template, test_data, view);
          if (!new_vals) { // an att handler has told us to skip this ele
            return null;
          }
          dom_builder.update_atts(template, new_vals);
          dom_builder.update_children(template, new_vals);
        }
      }

      var ele = document.createElement(template.tag);
      for (var att_name in template.atts) {
        ele.setAttribute(att_name, template.atts[att_name]);
      }
      for (var i = 0; i < template.children.length; i++) {
        var child_template = template.children[i];
        dom_builder.build_dom(ele, child_template, test_data, view);
      }

      return ele;
    },

    'tt-ele': function () {
      console.error('tt-ele builder not implemented yet');
      return null;
    },
  },

  build_dom: function (parent_ele, template, test_data, view) {
    var ele = dom_builder.node_handlers[template.type](template, test_data, view);
    if (ele) {
      parent_ele.appendChild(ele);
    }
  }
};

scope.treetests.build_dom = function (parent_ele, template, test_data, view) {
  dom_builder.build_dom(parent_ele, template, test_data, view);
};

})(this);
