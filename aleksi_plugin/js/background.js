chrome.browserAction.setBadgeText({text: "off"});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var resp = sendResponse;
        if (request.action == "reload") {
            updateStatus(sender.tab.id);
            sendResponse();
        }
        if (request.action == "analyze_word") {
            url = request.url;
            lang = request.lang;
            jQuery.ajax({
                url     : url,
        	    data : {'lang': lang},
                type    : 'POST',
                dataType: 'json',
                beforeSend : function() {
                    resp = sendResponse;
                },
                complete : function(xhr, textStatus) {
                    resp({xhr:xhr, textStatus:textStatus});
                }
            });
            return true;
        }
    }
);

chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateStatus(activeInfo.tabId);
});

function updateStatus(tabId) {
    chrome.tabs.sendMessage(tabId,{action: 'getStatus'}, function(response) {
        if (!response.initialized) {
            chrome.browserAction.setBadgeText({text: "off"});
        } else {
            if (response.enabled) {
                chrome.browserAction.setBadgeText({text: "on"});
            } else {
                chrome.browserAction.setBadgeText({text: "off"});
            }
        }
    });
}
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(toggle);
/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    if ( changeInfo.status === "complete" )
    {
        update(tab);
    }
});
*/
//chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) { updateStatus(addedTabId) });
/*
    chrome.tabs.executeScript(tab.id, {code: "var initialized = false;"});
    chrome.tabs.executeScript(tab.id, {file: "jquery-ui-1.12.0/external/jquery/jquery.js"});
    chrome.tabs.executeScript(tab.id, {file: "jquery-ui-1.12.0/jquery-ui.min.js"});
    chrome.tabs.insertCSS({file: "css/lookup.css"});
    chrome.tabs.insertCSS({file: "jquery-ui-1.12.0/jquery-ui.min.css"});
    chrome.tabs.executeScript(tab.id, {file: "js/lookup.js"}, function() {
*/
function updateIconState(response) {
    if ( response.enabled ) {
        console.log("aleksi plugin enabled");
        chrome.browserAction.setBadgeText({text: "on"});
    } else {
        console.log("aleksi plugin disabled");
        chrome.browserAction.setBadgeText({text: "off"});
    }
}
function toggle(tab) {
    chrome.tabs.sendMessage(tab.id,{action: 'getStatus'}, function(response) {
        if (response.initialized) {
            console.log("aleksi plugin initialized");
            if (!response.enabled) {
                chrome.tabs.sendMessage(tab.id,{action: 'enable'}, updateIconState);
            } else {
                chrome.tabs.sendMessage(tab.id,{action: 'disable'}, updateIconState);
            }
        } else {
            console.log("initializing aleksi plugin");
            chrome.tabs.sendMessage(tab.id,{action: 'initialize', url: tab.url}, function(response) {
                if (response.initialized) {
                    console.log("aleksi plugin initialized. enabling aleksi plugin");
                    chrome.tabs.sendMessage(tab.id,{action: 'enable'}, updateIconState );
                }
            });
        }
    });
//    });
}
