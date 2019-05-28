var isMobile = false; //initiate as false
var isFacebook = false;
var url;

var initialized = false;
var enabled = false;

chrome.runtime.sendMessage({action: 'get_settings'}, function(response) {
    chrome.storage.sync.get(response, function(result) { 
        settings = result;
        update_settings();
    });
});
/*
chrome.runtime.sendMessage({action: 'get_pins'}, function(response) {
    chrome.storage.sync.get(response, function(result) { 
        pins = result;
        update_settings();
    });
});
*/

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    if (key == 'pins') {
      pins = changes[key].newValue;
    } else {
      settings[key] = changes[key].newValue;
    }
  }
  $jquery_aleksi("#disable_links_checkbox").prop("checked",settings['disable_links']);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action=='getStatus')
            sendResponse({enabled: enabled, initialized: initialized});
        if (request.action=='initialize') {
            if (typeof settings != "undefined") {
                url = request.url;
                facebookRegExp = /https?:\/\/www.facebook.com\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
                isFacebook = facebookRegExp.test(url);
                inject_html();
                initialize_aleksi();
                initialized = true;
            }
            sendResponse({enabled: enabled, initialized: initialized});
        }
        if (request.action=='enable') {
            bindHandlers();
            enabled = true;
            sendResponse({enabled: enabled, initialized: initialized});
        }
        if (request.action=='disable') {
            $jquery_aleksi("#aleksi_dialog").dialog("close");
            unbindHandlers();
            enabled = false;
            sendResponse({enabled: enabled, initialized: initialized});
        }
    }
);

