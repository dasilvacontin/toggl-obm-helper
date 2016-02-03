var jQuery = window.jQuery || require('jquery');

function randomStr(len) {
  var pool = 'qwertyuiopasdfghjklzxcvbnm1234567890'.split('');
  var str = [];
  for(var i = 0 ; i < len ; i++) {
    str.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  return str.join('');
}

function signUp(group) {
  var email = group + '-' + randomStr(8) + '@toggl.com';
  var password = '123123';
  console.log('OBM Groper: Signing up \'' + email + '\' with password \'' + password + '\'');
  jQuery.ajax({
    url: "/api/v8/signups",
    type: "POST",
    contentType: 'application/json',
    data: JSON.stringify({user: {
      email: email,
      password: password,
      created_with: "TogglNext"
    }}),
    success: function() {
      console.log('OBM Groper: Checking group');
      logIn(
        email,
        password,
        function() {
          checkGroup(group, function() {
            // Success
            console.log('OBM Groper: Success!');
            document.location = '/app';
          }, function() {
            // Try again
            setTimeout(function() { signUp(group) }, 1000);
          });
        }
      );
    }
  });
}

function logIn(email, password, cb) {
  jQuery.ajax({
    url: "/api/v8/sessions",
    type: "POST",
    headers: {'Authorization': 'Basic ' + btoa(email + ':' + password)},
    contentType: 'application/json',
    data: JSON.stringify({
      remember_me: false,
      created_with: 'OBMGroper'
    }),
    success: cb
  });
}

function checkGroup(group, success, fail) {
  jQuery.ajax({
    url: "/api/v9/me/experiments/web",
    type: "GET",
    success: function(data) {
      console.log('OBM Groper: Got group \'included:' + data.included + '\' (nr:' + data.nr + ')');
      if(data.included === (group === 'included')) {
        success();
      } else {
        fail();
      }
    }
  });
}

function run(group) {
  var overlay = jQuery('<div />').css({
    background: 'black',
    opacity: '.8',
    position: 'fixed',
    zIndex: 999999,
    padding: '40px',
    top: 0, left: 0, right: 0, bottom: 0,
    textAlign: 'center',
    color: 'white',
    fontSize: '16px'
  }).text('Creating a user for group \'' + group + '\'').appendTo(jQuery('body'))

  signUp(group);
}

run('included');
