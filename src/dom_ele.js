(function (scope) {

var DomEle = function (template) {
  this.tag = template.tag;
  this.atts = {};
  for (var att in template.atts) {
    this.atts[att] = template.atts[att];
  }
  this.children = [];
  this.skip = false;

  this.trim_class_string();
};
DomEle.prototype = {
  trim_class_string: function (class_string) {
    if (!class_string) {
      class_string = this.atts['class'];
      if (!class_string) {
        return;
      }
    }

    var split_class = class_string.trim().split(' ');
    class_string = [];
    for (var i = 0; i < split_class.length; i++) {
      if (split_class[i]) {
        class_string.push(split_class[i]);
      }
    }
    class_string = class_string.join(' ');

    if (class_string) {
      this.atts['class'] = class_string;
    } else {
      delete this.atts['class'];
    }
  },

  add_class: function (new_class) {
    if (this.atts['class']) {
      this.atts['class'] += new_class;
    } else {
      this.atts['class'] = new_class;
    }
    this.trim_class_string();
  },

  build: function () {
    if (this.skip) {
      return null;
    }

    var ele = document.createElement(this.tag);
    for (var att_name in this.atts) {
      ele.setAttribute(att_name, this.atts[att_name]);
    }

    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      if (typeof child === 'string') {
        child = document.createTextNode(child);
      } else if (child instanceof DomEle) {
        child = child.build();
      } else {
        child = null;
      }

      if (child) {
        ele.appendChild(child);
      }
    }

    return ele;
  }
};

scope.treetests.DomEle = DomEle;

})(this);
