/*
 * test_data cat fields:
 * name // name/label of the category
 * type // string 'category'
 * cats_passed // number of child categories that passed all tests
 * cat_count // number of child categories
 * tests_passed // number of all descendant tests that passed
 * tests_count // number of all descendant tests
 * children // child tests or categories
 *
 * test_data test fields:
 * name // name/label of the test
 * type // string 'test'
 * passed // boolean indicating whether on not the test passed
 * message // optional error message for test
 */

(function (scope) {

/*******************************************************************************
 * setup
*******************************************************************************/

var treetests = {
  version: '0.0.0',
  tt_att_prefix: 'data-tt-',
};

/*******************************************************************************
 * public interface
*******************************************************************************/

/*******************************************************************************
 * templater
*******************************************************************************/
var templater = {
  remove_ids: true,

  get_atts: function (ele) {
    var atts = {
      tt_atts: {},
      atts: {}
    };
    for (var i = 0; i < ele.attributes.length; i++) {
      var att = ele.attributes[i];
      if (att.name.substr(0, treetests.tt_att_prefix.length) === treetests.tt_att_prefix) {
        atts.tt_atts[att.name] = att.value;
      } else if (!this.remove_ids || att.name !== 'id') {
        atts.atts[att.name] = att.value;
      }
    }
    return atts;
  },

  is_tt_tag: function (ele) {
    return ele.tagName.toLowerCase().substr(0, treetests.tt_att_prefix.length) === treetests.tt_att_prefix;
  },

  templatize: function (ele) {
    var dom_path = arguments[1] || [];

    var template = {
      dom_path: dom_path
    };
    if (ele.nodeType === 3) { // text node
      template.type = 'text';
      template.value = ele.data;
    } else if (ele.nodeType === 1) { // html element
      var atts = this.get_atts(ele);
      template.type = (this.is_tt_tag(ele) && 'tt-ele') || 'ele';
      template.tag = ele.tagName.toLowerCase();
      template.tt_atts = atts.tt_atts;
      template.atts = atts.atts;
    } else {
      console.warn('[treetests] Unable to templatize node of type ' + ele.nodeType + '\nDOM PATH: ' + JSON.stringify(dom_path));
      return null;
    }

    template.children = [];
    for (var i = 0; ele.childNodes && i < ele.childNodes.length; i++) {
      var child = this.templatize(ele.childNodes[i], dom_path.concat([i]));
      if (child) {
        template.children.push(child);
      }
    }

    return template;
  }
};

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
            dom_path: template_ele.dom_path.concat([template_ele.children.length]),
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
    text: function (template) {
      return document.createTextNode(template.value);
    },

    ele: function (template, test_data, view) {
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

/*******************************************************************************
 * export
*******************************************************************************/
treetests.templater = templater;
treetests.dom_builder = dom_builder;

scope.treetests = treetests;

})(this);
