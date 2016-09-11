var fake_test_count = 0;
var fake_test_pass = function(test_vars) {
  fake_test_count++;
};
var fake_test_fail = function(test_vars) {
  throw {
    message: 'fake test fail ' + fake_test_count++
  };
};

var test_suite = new treetests.TestSuite({
  name: 'test suite'
});

test_suite.add('top level category', {
  'mid cat 1': {
    'a': fake_test_pass,
    'b': fake_test_pass,
    'c': fake_test_fail,
    'down cat a': {
      'aa': fake_test_fail,
      'bb': fake_test_pass,
      'cc': fake_test_pass,
    },
    'down cat b': {
      'baa': fake_test_pass,
      'bbb': fake_test_pass,
      'bcc': fake_test_pass,
    },
  },
  'mid cat 2': {
    'a': fake_test_pass,
    'b': fake_test_pass,
    'c': fake_test_pass,
    'd': fake_test_pass,
    'e': {
      'ee': fake_test_pass
    },
  }
});

var test_results = test_suite.run();
