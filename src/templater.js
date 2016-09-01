(function (scope) {

/*******************************************************************************
 * templater
*******************************************************************************/
var Template = function (template_obj) {
  this.app = null;
  for (var key in template_obj) {
    this[key] = template_obj[key];
  }
};
Template.prototype = {
  clone_field_into: function (new_obj, field_name) {
    switch (typeof this[field_name]) {
      case 'object':
        if (Array.isArray(this[field_name])) {
          new_obj[field_name] = [];
          for (var i = 0; i < this[field_name].length; i++) {
            var val = this[field_name][i];
            if (val instanceof Template) {
              val = val.clone();
            }
            new_obj[field_name].push(val);
          }
          return;
        } else {
          new_obj[field_name] = {};
          for (var key in this[field_name]) {
            new_obj[field_name][key] = this[field_name][key];
          }
          return;
        }
      case 'string':
      case 'number':
        new_obj[field_name] = this[field_name];
        return;
    }
  },

  to_obj: function () {
    var new_obj = {};
    this.clone_field_into(new_obj, 'type');
    this.clone_field_into(new_obj, 'value');
    this.clone_field_into(new_obj, 'tag');
    this.clone_field_into(new_obj, 'view');
    this.clone_field_into(new_obj, 'tt_atts');
    this.clone_field_into(new_obj, 'atts');
    this.clone_field_into(new_obj, 'children');
    return new_obj;
  },

  clone: function () {
    return new Template(this.to_obj());
  }
};

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
        // the data-tt-view att is a special case
        if (att.name == treetests.tt_att_prefix + 'view') {
          atts.view = att.value;
        } else {
          atts.tt_atts[att.name] = att.value;
        }
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
    var template = {};
    if (ele.nodeType === 3) { // text node
      template.type = 'text';
      template.value = ele.data;
    } else if (ele.nodeType === 1) { // html element
      template.type = (this.is_tt_tag(ele) && 'tt-ele') || 'ele';
      template.tag = ele.tagName.toLowerCase();
      var atts = this.get_atts(ele);
      if (atts.view) {
        template.view = atts.view;
      }
      template.tt_atts = atts.tt_atts;
      template.atts = atts.atts;
    } else {
      console.warn('[treetests] Unable to templatize node ' + ele);
      return null;
    }

    template.children = [];
    for (var i = 0; ele.childNodes && i < ele.childNodes.length; i++) {
      var child = this.templatize(ele.childNodes[i]);
      if (child) {
        template.children.push(child);
      }
    }

    template = new Template(template);

    return template;
  }
};

scope.treetests.Template = Template;
scope.treetests.templatize = function (ele) {return templater.templatize(ele)};

})(this);
