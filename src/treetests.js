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

var treetests = {
  version: '0.0.0',
  tt_att_prefix: 'data-tt-'
};

scope.treetests = treetests;

})(this);
