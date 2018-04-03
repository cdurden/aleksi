chrome.browserAction.setBadgeText({text: "off"});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "reload") {
            updateStatus(sender.tab.id);
            sendResponse();
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
function toggle(tab) {
    chrome.tabs.sendMessage(tab.id,{action: 'getStatus'}, function(response) {
//        alert(response.initialized);
        if (!response.initialized) {
            chrome.tabs.sendMessage(tab.id,{action: 'initialize', url: tab.url}, function(response) {
//                chrome.tabs.insertCSS(tab.id, {file: "jquery-ui-1.12.0/jquery-ui.min.css"}, function() { 
//                    chrome.tabs.executeScript(tab.id, {file: "js/jquery-ui-content.hack.js"});
//                });
                chrome.tabs.sendMessage(tab.id,{action: 'enable'}, function(response) {
                    chrome.browserAction.setBadgeText({text: "on"});
                });
            });
        } else {
            if (!response.enabled) {
                chrome.tabs.sendMessage(tab.id,{action: 'enable'}, function(response) {
                    chrome.browserAction.setBadgeText({text: "on"});
                });
            } else {
                chrome.tabs.sendMessage(tab.id,{action: 'disable'}, function(response) {
                    chrome.browserAction.setBadgeText({text: "off"});
                });
            }
        }
    });
//    });
}
