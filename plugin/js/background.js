
var settings = {'analyse_url': "http://www.aleksi.org/analyse/{word}.json",
                        'anki_connect_url': 'http://localhost:8765',
                        'disable_links': false};
//var settings = {};

// https://foosoft.net/projects/anki-connect/index.html#application-interface-for-developers
function anki_request(action, params) {
    return {'action': action, 'params': params, 'version': 6}
}

chrome.browserAction.setBadgeText({text: "off"});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var resp = sendResponse;
        //if (request.action == "reload_options") {
        //    sendResponse({settings: settings});
        //    //chrome.tabs.sendMessage(request.tab.id,{action: 'reload_options'});
        //}

        if (request.action == "anki_connect_store_media_file") {
            media_data = request.media_data; // base64 encoded
            filename = md5(media_data)+'.png';
            data = anki_request('storeMediaFile', {'filename': filename, 'data': media_data});
            chrome.storage.sync.get({'anki_connect_url': settings['anki_connect_url']}, function(result) { 
                var url = result.anki_connect_url
                jQuery.ajax({
                    'url'  : url,
            	    'data' : JSON.stringify(data),
                    'contentType': 'application/json; charset=utf-8',
                    'type' : 'POST',
                    'dataType' : 'json',
                    'beforeSend' : function() {
                        //track_anki_request();
                    },
                    success : function(response, textStatus, xhr) {
                        sendResponse({'filename': filename, 'textStatus': textStatus, 'xhr': xhr, 'response': response});
                        //track_anki_success(response);
                    },
                    error : function(xhr, textStatus, errorText) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'errorText': errorText});
                        //track_anki_error(errorText);
                    }
                });
            });
            return true;
        }
        if (request.action == "anki_connect_create_deck") {
            data = anki_request('createDeck', {'deck': request.deckName});
            chrome.storage.sync.get({'anki_connect_url': settings['anki_connect_url']}, function(result) { 
                var url = result.anki_connect_url
                jQuery.ajax({
                    'url'  : url,
            	    'data' : JSON.stringify(data),
                    'contentType': 'application/json; charset=utf-8',
                    'type' : 'POST',
                    'dataType' : 'json',
                    'beforeSend' : function() {
                        //track_anki_request();
                    },
                    success : function(response, textStatus, xhr) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'response': response});
                        //track_anki_success(response);
                    },
                    error : function(xhr, textStatus, errorText) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'errorText': errorText});
                        //track_anki_error(errorText);
                    }
                });
            });
            return true;
        }
        if (request.action == "anki_connect_get_decks") {
            data = anki_request('deckNames');
            chrome.storage.sync.get({'anki_connect_url': settings['anki_connect_url']}, function(result) { 
                var url = result.anki_connect_url
                jQuery.ajax({
                    'url'  : url,
            	    'data' : JSON.stringify(data),
                    'contentType': 'application/json; charset=utf-8',
                    'type' : 'POST',
                    'dataType' : 'json',
                    'beforeSend' : function() {
                        //track_anki_request();
                    },
                    success : function(response, textStatus, xhr) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'response': response});
                        //track_anki_success(response);
                    },
                    error : function(xhr, textStatus, errorText) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'errorText': errorText});
                        //track_anki_error(errorText);
                    }
                });
            });
            return true;
        }
        if (request.action == "anki_connect_add_pins") {
            var media_html = '';
            notes = request.pins.map(function(pin) {
                if ('media_filename' in pin) {
                    media_html = "<div><img src='"+pin.media_filename+"'/></div>";
                }
                note = {
                    "deckName": request.deckName,
                    "modelName": "Basic",
                    "fields": {
                        "Front": pin['lemma']+media_html,
                        "Back": pin['text'] 
                    },
                    "tags": []
                };
                return note;
            });
            data = anki_request('addNotes', {'notes': notes});
            chrome.storage.sync.get({'anki_connect_url': settings['anki_connect_url']}, function(result) { 
                var url = result.anki_connect_url
                jQuery.ajax({
                    'url'  : url,
            	    'data' : JSON.stringify(data),
                    'contentType': 'application/json; charset=utf-8',
                    'type' : 'POST',
                    'dataType' : 'json',
                    'beforeSend' : function() {
                        //track_anki_request();
                    },
                    success : function(response, textStatus, xhr) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'response': response});
                        //track_anki_success(response);
                    },
                    error : function(xhr, textStatus, errorText) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'errorText': errorText});
                        //track_anki_error(errorText);
                    }
                });
            });
            return true;
        }
        if (request.action == "get_settings") {
            sendResponse(settings);
        }
        if (request.action == "reload") {
            updateStatus(sender.tab.id);
            sendResponse();
        }
        if (request.action == "get_pins") {
            chrome.storage.sync.get({'pins': []}, function(result) { 
                pins = result.pins;
                sendResponse(pins);
            });
            return true;
        }
        if (request.action == "unpin") {
            chrome.storage.sync.get({'pins': []}, function(result) { 
                pins = result.pins;
                for (i=0; i<pins.length; i++) {
                    if(pins[i].id == request.pin_id) pins.splice(i,1)
                }
                chrome.storage.sync.set({'pins': pins}, function() { 
                    sendResponse(pins);
                });
            });
            return true;
        }
        if (request.action == "update_pin") {
            chrome.storage.sync.get({'pins': []}, function(result) { 
                pins = result.pins;
                for (i=0; i<pins.length; i++) {
                    if(pins[i].id == request.pin.id) {
                        pins[i] = pin;
                    }
                }
                chrome.storage.sync.set({'pins': pins}, function() { 
                    sendResponse(pins);
                });
            });
            return true;
        }
        if (request.action == "pin") {
            chrome.storage.sync.get({'pins': []}, function(result) { 
                pins = result.pins;
                pins.push(request.pin);
                pins = generate_pin_ids(pins);
                chrome.storage.sync.set({'pins': pins}, function() { 
                    sendResponse({'pins': pins, 'new_pin_id': request.pin.id});
                });
            });
            return true;
        }
        if (request.action == "clear_pins") {
            chrome.storage.sync.set({'pins': []}, function() { 
                sendResponse([]);
            });
            return true;
        }
        if (request.action == "analyse") {
            chrome.storage.sync.get({'analyse_url': settings['analyse_url']}, function(result) { 
                var url = result.analyse_url.replace("{word}",request.word)
                lang = request.lang;
                jQuery.ajax({
                    url     : url,
            	    data : {'lang': lang},
                    type    : 'POST',
                    dataType: 'json',
                    beforeSend : function() {
                        track_analysis_request();
                    },
                    success : function(response, textStatus, xhr) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'response': response});
                        track_analysis_success(response);
                    },
                    error : function(xhr, textStatus, errorText) {
                        sendResponse({'textStatus': textStatus, 'xhr': xhr, 'errorText': errorText});
                        track_analysis_error(errorText);
                    }
                    //complete : function(xhr, textStatus) {
                    //    resp({xhr:xhr, textStatus:textStatus});
                    //}
                });
            });
            return true;
        }
    }
);

chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateStatus(activeInfo.tabId);
});

function updateStatus(tabId) {
    chrome.tabs.sendMessage(tabId,{action: 'getStatus'}, updateIconState );
}
/*
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
*/
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
function generate_pin_ids(pins) {
    min_id = 0;
    for (i=0; i<pins.length; i++) {
        try {
            if(!Number.isInteger(pins[i].id)) throw "not an integer";
        } catch(err) {
            pins[i].id=min_id;
        } finally {
            current_id = pins[i].id;
            if(current_id < min_id) throw "not increasing";
            min_id = Math.max(min_id,current_id+1)
        }
    }
    return(pins)
}
