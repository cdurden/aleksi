var isMobile = false; //initiate as false
var isFacebook = false;
var url;

var initialized = false;
var enabled = false;

/*
var port = chrome.runtime.connect();
function setupGoogleAnalytics() {
      if (!window.ga) {
              (function(){
                        window.ga = function() {
                                    (window.ga.q = window.ga.q || []).push(arguments);
                                  }, window.ga.l = 1 * new Date();
                        var tag = 'script';
                        var a = document.createElement(tag);
                        var m = document.getElementsByTagName(tag)[0];
                        a.async = 1;
                        a.src = 'https://www.google-analytics.com/analytics.js';
                        m.parentNode.insertBefore(a, m);
                      })();
              ga('create', 'UA-140774445-1', 'auto');
              ga('set', 'checkProtocolTask', null);
            }
}
setupGoogleAnalytics();

ga('send', 'pageview');

function track_analysis_success(result) {
  ga('send', 'event', 'analysis', 'analysis_success', undefined, result['lemmas'].map(function(lemma) { return lemma['translations'].length }).reduce(function(s,k) { return s+k }));
};
function track_analysis_error(errorText) {
  ga('send', 'event', 'analysis', 'analysis_error', errorText);
};
function track_pin_event(e) {
  ga('send', 'event', 'pin', 'pin_lemma');
};
*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-140774445-1']);
_gaq.push(['_trackPageview']);

(function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.sendMessage({action: 'get_settings'}, function(response) {
    chrome.storage.sync.get(response, function(result) { 
        settings = result;
        update_settings();
    });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    settings[key] = changes[key].newValue;
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

