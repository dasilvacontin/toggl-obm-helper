/*
 * Small bookmarklet to help test obm experiments.
 * Adds a small clicktrhough box in the lower right corner with OBM data.
 * The data is always updated from the backend so it displays what the API sees.
 * Tested in Chrome & Firefox
 */
(function() {
  // e({a:1, b:{c:2}}, 'b.c', 'default') returns 2 ('default' if path not found or not defined)
  // e({a:1, b:{c:2}}, 'b.c.d', 'default') returns 'default'
  var e = function(obj, key, defValue) {
    if(typeof key === 'string') key = key.split('.');
    if(typeof obj === 'undefined' || obj === null) obj = {};
    var val = typeof obj[key[0]] !== 'undefined' ? obj[key[0]] : defValue;
    if(key.length > 1) {
      val = e(val, key.slice(1), defValue);
    }
    return val;
  }

  var userData = e(toggl, 'currentUser.attributes', {});
  var obmData = {};


  var overlay = $("<pre/>", {
        id: "obm-helper-overlay"
      }).css({
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "white",
        opacity: .5,
        padding: 10,
        "z-index": 9999999,
        font: '12px/1.4 "Monaco", "Courier New", sans-serif',
        "pointer-events": "none",
        "box-shadow": "#ccc 1px 1px 10px"
      });

  var render = function() {
    var wsId = e(toggl, 'model.Workspaces', {selectedId: function() { return '-'; }}).selectedId() || '-';
    overlay.html("user id:   <span style='pointer-events: all;'>" + e(userData, 'id', '-') +
    "</span>\nws id:     <span style='pointer-events: all;'>" + wsId +
    "</span>\nnr:        " + e(obmData, 'nr', '-') + "\nincluded:  " + e(obmData, 'included', '-') +
    "\nactions:   " + e(obmData, 'actions', ''))
  };

  $("#obm-helper-overlay").remove();
  $("body").append(overlay);
  render(userData, obmData);

  ((toggl || {}).vent || {on: function() {}}).on("all", render);

  var fetchObmData = function() {
    jQuery.ajax({
      url: "/api/v9/me/experiments/web",
      type: "GET"
    });
  }

  jQuery(document).ajaxSuccess(function(e, xhr, options, response) {
    if(/obm\/actions(\/)?$/.test(options.url.split("?")[0]) && options.type.toUpperCase() == "POST") {
      // Trigger refresh of data to get actions
      fetchObmData();
    }
    if(/me$/.test(options.url.split("?")[0]) && options.type.toUpperCase() == "GET") {
      userData = response.data;
      render();
    }
    if(/me\/experiments\/web(\/)?$/.test(options.url.split("?")[0]) && options.type.toUpperCase() == "GET") {
      obmData = response;
      render();
    }
  });

  fetchObmData(); // To get initial obmData

}());