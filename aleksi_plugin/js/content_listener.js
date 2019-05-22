var isMobile = false; //initiate as false
var isFacebook = false;
var url;

var initialized = false;
var enabled = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action=='getStatus')
            sendResponse({enabled: enabled, initialized: initialized});
        if (request.action=='initialize') {
            url = request.url;
            facebookRegExp = /https?:\/\/www.facebook.com\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
            isFacebook = facebookRegExp.test(url);
            initialize_aleksi();
            initialized = true;
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

chrome.runtime.sendMessage({action: 'reload'},function(response) {});


