(function (scope) {

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
    var template = {};
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

    return template;
  }
};

scope.treetests.templatize = function (ele) {return templater.templatize(ele)};

})(this);
