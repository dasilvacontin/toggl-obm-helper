var jQuery = window.jQuery || require('jquery');

function randomStr(len) {
  var pool = 'qwertyuiopasdfghjklzxcvbnm1234567890'.split('');
  var str = [];
  for(var i = 0 ; i < len ; i++) {
    str.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  return str.join('');
}

function signUp(group, numTries) {
  if(!numTries) numTries = 0;
  if(numTries > 20) {
    return createOverlay("Failed after 20 retries. Is the backend set up for the experiment?");
  }
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
            setTimeout(function() { signUp(group, numTries + 1) }, 1000);
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

function createOverlay(txt) {
  jQuery('.obm-groper-overlay').remove();
  var gif = jQuery('<img src="http://thecatapi.com/api/images/get?format=src&type=gif">').css({
    display: 'block',
    maxWidth: '500px',
    margin: '50px auto'
  });
  var overlay = jQuery('<div />').addClass('obm-groper-overlay').css({
    background: 'rgba(0,0,0,160)',
    position: 'fixed',
    zIndex: 999999,
    padding: '40px',
    top: 0, left: 0, right: 0, bottom: 0,
    textAlign: 'center',
    font: '16px sans-serif',
    color: 'white',
    fontSize: '16px'
  }).text(txt).append(gif).appendTo(jQuery('body'))
}

function run(group) {
  createOverlay('Creating a user for group \'' + group + '\'');
  signUp(group);
}

run('included');
