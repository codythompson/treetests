/*
 * test_data cat fields:
 * name // name/label of the category
 * type // string 'category'
 * cats_passed // number of child categories that passed all tests
 * cat_count // number of child categories
 * tests_passed // number of tests passed stricly within this cat
 * test_count // number of tests stricly within this cat
 * total_tests_passed // number of all descendant tests that passed
 * total_test_count // number of all descendant tests
 * children // child tests or categories
 *
 * test_data test fields:
 * name // name/label of the test
 * type // string 'test'
 * passed // boolean indicating whether on not the test passed
 * message // optional error message for test
 */

(function (scope) {
var TestSuite = function (options) {
  this.children = {};
  // TODO
  // this.metadata = {};

  // TODO watered down lodash to make use of _.extend and _.defaults
  this.name = options.name || null;
  this.init_func = options.init_func || null;
};
TestSuite.prototype = {
  add: function (name, test_or_cat) {
    this.children[name] = test_or_cat;
  },

  run: function () {
    var test_vars;
    if (this.init_func) {
      test_vars = this.init_func(tests);
    }

    var results = this.run_test(test_vars, this.children, this.name);
    results.type = 'suite';
    return results;
  },

  run_test: function (test_vars, test, name) {
    if (typeof test === 'function') {
      try {
        test(test_vars);
      } catch (e) {
        return this.create_test_result(name, false, e.message);
      }
      // if this gets executed the test passed
      return this.create_test_result(name, true);
    } else if (typeof test === 'object') {
      if (test instanceof TestSuite) {
        return test.run();
      } else if (test !== null) {
        var results = {
          type: 'cat',
          name: name,
          cats_passed: 0,
          cat_count: 0,
          tests_passed: 0,
          test_count: 0,
          total_tests_passed: 0,
          total_test_count: 0
        };

        var children = [];
        for (var child_name in test) {
          var result = this.run_test(test_vars, test[child_name], child_name);
          this.add_results(results, result);
          children.push(result);
        }
        results.children = children;

        return results;
      } else {
        throw '[treetests] null test encountered name: "' + name + '"';
      }
    } else {
      throw '[treetests] unexpected test type: "' + typeof test + '" name: "' + name + '"';
    }
  },

  add_results: function (results, child_result) {
    if (child_result.type === 'test') {
      results.test_count++;
      results.total_test_count++;
      if (child_result.passed) {
        results.tests_passed++;
        results.total_tests_passed++;
      }
    } else { // else it's a cat or a test suite
      results.cat_count++;
      if (child_result.cats_passed === child_result.cat_count &&
          child_result.tests_passed === child_result.test_count) {
        results.cats_passed++;
      }
      results.total_test_count += child_result.total_test_count;
      results.total_tests_passed += child_result.total_tests_passed;
    }
  },

  create_test_result: function (name, passed, message) {
    var result = {
      type: 'test',
      name: name,
      passed: passed,
      message: message || null
    };
    return result;
  },
};

scope.treetests.TestSuite = TestSuite;

})(this);
