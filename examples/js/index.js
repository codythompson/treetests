window.addEventListener('load', function () {
app = new treetests.app();

app.add_template('tt-results-wrapper', 'results-wrapper');
// app.add_template('tt-suite-template', 'suite-template');
// app.add_template('tt-cat-template', 'cat-template');
app.add_template('tt-test-template', 'test-template');
app.add_template('tt-test-child', 'test-child');

app.add_controller('suite', function () {
  this.cont_class = 'suite blotty';
  this.title_text = 'not initialized';
  this.title_desc = ' - / -';

  this.set_model = function (model) {
    if (model.cats_passed === model.cat_count) {
      this.cont_class = 'suite classy';
    } else {
      this.cont_class = 'suite notty';
    }
    this.title_text = model.name;
    this.desc_text = ' ' + model.cats_passed + ' / ' + model.cat_count;
    this.desc_text += ' ' + model.total_tests_passed + ' / ' + model.total_test_count;
  };
});
app.add_controller('cat', function () {
  this.cont_class = 'cat blotty';
  this.title_text = 'not initialized';
  this.title_desc = ' - / -';

  this.set_model = function (model) {
    if (model.cats_passed === model.cat_count) {
      this.cont_class = 'cat classy';
    } else {
      this.cont_class = 'cat notty';
    }
    this.title_text = model.name;
    this.desc_text = ' ' + model.cats_passed + ' / ' + model.cat_count;
    this.desc_text += ' ' + model.total_tests_passed + ' / ' + model.total_test_count;
  };
});
app.add_controller('test', function () {
  this.cont_class = 'test blotty';
  this.title_text = 'not initialized';
  this.title_desc = ' - / -';

  this.set_model = function (model) {
    if (model.passed) {
      this.cont_class = 'test classy';
    } else {
      this.cont_class = 'test notty';
    }
    this.title_text = model.name;
    this.desc_text = (model.passed && ' passed') || ' failed';
    if (model.message) {
      this.desc_text += model.message;
    }
  };
});

app.inject('tt-results-wrapper', null, test_results, app.get_controller('suite'));
});
