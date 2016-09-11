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

var treetests = {
  version: '0.0.0',
  tt_att_prefix: 'data-tt-',
  tt_tag_prefix: 'tt-'
};

scope.treetests = treetests;

})(this);
