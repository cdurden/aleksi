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
            sendResponse({'enabled': enabled, 'initialized': initialized});
        if (request.action=='login') {
            var win = window.open(request.authUrl);
            var id = setInterval(function () {
                if (win.location.href.indexOf(request.authUrl) < 0) {
                    clearInterval(id);
                    //ready to close the window.
                    win.close();
                }
            }, 500);
            sendResponse({});
        }
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
            $jquery_aleksi("#aleksi_word").text("");
            $jquery_aleksi("#analysis_failed").hide();
            $jquery_aleksi("#analysis_results").show();
            $jquery_aleksi("body").css("cursor","pointer");
            load_last_analysis_results();
            //update_translations_table();
            show_dialog();
            activateOCR();
        }
        if (request.action=='disable') {
            $jquery_aleksi("#aleksi_dialog").dialog("close");
            $jquery_aleksi("body").css("cursor","auto");
            unbindHandlers();
            enabled = false;
            sendResponse({enabled: enabled, initialized: initialized});
        }
    }
);

function activateOCR() {
    chrome.runtime.sendMessage({
                'evt': 'activateOCR',
            }, function() {});
}

function load_last_analysis_results() {
    chrome.runtime.sendMessage({action: 'get_last_analysis_results'}, function(response) {
        $jquery_aleksi("#aleksi_word" ).text(response['last_analysis_results']['word']);
        $jquery_aleksi("#analysis_failed").hide();
        $jquery_aleksi("#analysis_results").hide();
        $jquery_aleksi("#requesting_analysis").show();
        update_translations_table(response['last_analysis_results']['results']);
    });
}
