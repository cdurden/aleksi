var logger = console;
var settings = {'analyse_url': "http://www.aleksi.org/analyse/{word}.json",
                        'implicitGrantUrl': "https://accounts.google.com/o/oauth2/auth",
                        'authUrl': 'http://www.aleksi.org/login/google-oauth2/',
                        'anki_connect_url': 'http://localhost:8765',
                        'disable_links': false};
//var settings = {};

// https://foosoft.net/projects/anki-connect/index.html#application-interface-for-developers
function anki_request(action, params) {
    return {'action': action, 'params': params, 'version': 6}
}
/*
function init(cfg, log) {
      settings = cfg;
      logger = log;
}
*/

chrome.browserAction.setBadgeText({text: "off"});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var resp = sendResponse;
        //if (request.action == "reload_options") {
        //    sendResponse({settings: settings});
        //    //chrome.tabs.sendMessage(request.tab.id,{action: 'reload_options'});
        //}

        if (request.action == "anki_connect_store_media_data") {
            media_data = request.media_data; // base64 encoded
            var filename = md5(media_data)+'.png';
            data = anki_request('storeMediaFile', {'filename': filename, 'data': media_data});
            (function(filename) {
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
            })(filename);
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
            var context_html = '';
            notes = request.pins.map(function(pin) {
                if ('media_filename' in pin) {
                    media_html = "<div><img src='"+pin.media_filename+"'/></div>";
                }
                if ('context' in pin && typeof pin.context != 'undefined') {
                    context_html = "<p>"+pin.context+"</p>";
                }
                note = {
                    "deckName": request.deckName,
                    "modelName": "Basic",
                    "fields": {
                        "Lemma": pin['lemma'],
                        "Word": pin['word'],
                        "TranslationText": pin['text'],
                        "Context": context_html,
                        "Media": media_html 
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
        if (request.action == "get_last_analysis_results") {
            chrome.storage.local.get({'last_analysis_results': 
                {
                    'word': 'tervetuloa', 
                    'results': {"wordform": "tervetuloa", "lemmas":
                        [
                            {"translations": 
                                [{"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "healthy, sane (enjoying health and vigor of body, mind, or spirit)", "source": "Wiktionary"}, {"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "healthy, sound (beneficial)", "source": "Wiktionary"}, {"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "sound, well (free from injury, disease)", "source": "Wiktionary"}, {"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "sound (complete, solid, or secure)", "source": "Wiktionary"}, {"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "able-bodied (having a sound, strong body)", "source": "Wiktionary"}, {"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "Said when meeting, hello", "source": "Wiktionary"}, {"from": "fin", "lemma": "terve", "source_url": "http://en.wiktionary.org/wiki/terve#Finnish", "to": "en", "text": "Said when departing, bye", "source": "Wiktionary"}]
                                , "lang": "fi", "lemma": "terve"}, 
                            {"translations": 
                                [{"from": "fin", "lemma": "tulo", "source_url": "http://en.wiktionary.org/wiki/tulo#Finnish", "to": "en", "text": "coming, arrival", "source": "Wiktionary"}, {"from": "fin", "lemma": "tulo", "source_url": "http://en.wiktionary.org/wiki/tulo#Finnish", "to": "en", "text": "product", "source": "Wiktionary"}, {"from": "fin", "lemma": "tulo", "source_url": "http://en.wiktionary.org/wiki/tulo#Finnish", "to": "en", "text": "income", "source": "Wiktionary"}, {"from": "fin", "lemma": "tulo", "source_url": "http://en.wiktionary.org/wiki/tulo#Finnish", "to": "en", "text": "revenue", "source": "Wiktionary"}, {"from": "fin", "lemma": "tulo", "source_url": "http://en.wiktionary.org/wiki/tulo#Finnish", "to": "en", "text": "in (port that takes an input signal of some kind)", "source": "Wiktionary"}]
                                , "lang": "fi", "lemma": "tulo"},
                            {"translations": 
                                [], "lang": "fi", "lemma": "tervetulo"},
                            {"translations": 
                                [{"from": "fin", "lemma": "tervetuloa", "source_url": "http://en.wiktionary.org/wiki/tervetuloa#Finnish", "to": "en", "text": "{{qualifier|when greeting}} welcome, great to see you, nice you could come", "source": "Wiktionary"}, {"from": "fin", "lemma": "tervetuloa", "source_url": "http://en.wiktionary.org/wiki/tervetuloa#Finnish", "to": "en", "text": "{{qualifier|after having arranged a visit}} looking forward to seeing you", "source": "Wiktionary"}, {"from": "fin", "lemma": "tervetuloa", "source_url": "http://en.wiktionary.org/wiki/tervetuloa#Finnish", "to": "en", "text": "{{qualifier|when inviting someone}} Would you like to visit us? It would be nice to have you over sometime. (Please) come again!  (Please) call again!", "source": "Wiktionary"}]
                                , "lang": "fi", "lemma": "tervetuloa"}
                        ], "tags": [{"SIJAMUOTO": "partitive", "CLASS": "noun", "WORDBASES": "+terve(terve)+tulo(tulo)", "BASEFORM": "tervetulo", "NUMBER": "singular", "STRUCTURE": "=ppppp=ppppp", "FSTOUTPUT": "[Lnl][Xp]terve[X]terve[Sn][Ny][Bh][Bc][Ln][Xp]tulo[X]tulo[Sp][Ny]a"}, {"CLASS": "huudahdussana", "STRUCTURE": "=ppppp=ppppp", "BASEFORM": "tervetuloa", "WORDBASES": "+tervetuloa(terve=tuloa)", "FSTOUTPUT": "[Lh][Xp]terve=tuloa[X]terve[Bm]tuloa"}]
                    } // end results
                }
            }, function(result) { 
                sendResponse(result);
            });
            return true;
        }
        if (request.action == "get_pins") {
            //chrome.storage.sync.get({'pins': []}, function(result) { 
            chrome.storage.local.get({'pins': []}, function(result) { 
                pins = result.pins;
                sendResponse(pins);
            });
            return true;
        }
        if (request.action == "unpin") {
            //chrome.storage.sync.get({'pins': []}, function(result) { 
            chrome.storage.local.get({'pins': []}, function(result) { 
                pins = result.pins;
                for (i=0; i<pins.length; i++) {
                    if(pins[i].id == request.pin_id) pins.splice(i,1)
                }
                //chrome.storage.sync.set({'pins': pins}, function() { 
                chrome.storage.local.set({'pins': pins}, function() { 
                    sendResponse(pins);
                });
            });
            return true;
        }
        if (request.action == "update_pin") {
            //chrome.storage.sync.get({'pins': []}, function(result) { 
            chrome.storage.local.get({'pins': []}, function(result) { 
                pins = result.pins;
                for (i=0; i<pins.length; i++) {
                    if(pins[i].id == request.pin.id) {
                        pins[i] = pin;
                    }
                }
                //chrome.storage.sync.set({'pins': pins}, function() { 
                chrome.storage.local.set({'pins': pins}, function() { 
                    sendResponse(pins);
                });
            });
            return true;
        }
        if (request.action == "pin") {
            //chrome.storage.sync.get({'pins': []}, function(result) { 
            chrome.storage.local.get({'pins': []}, function(result) { 
                pins = result.pins;
                pins.push(request.pin);
                pins = generate_pin_ids(pins);
                //chrome.storage.sync.set({'pins': pins}, function() { 
                chrome.storage.local.set({'pins': pins}, function() { 
                    sendResponse({'pins': pins, 'new_pin_id': request.pin.id});
                });
            });
            return true;
        }
        if (request.action == "clear_pins") {
            //chrome.storage.sync.set({'pins': []}, function() { 
            chrome.storage.local.set({'pins': []}, function() { 
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
                        chrome.storage.local.set({'last_analysis_results': {'word': request.word, 'results': response}}, function() {});
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

chrome.tabs.onUpdated.addListener(function(tabId) {
    chrome.browserAction.setBadgeText({text: "off"});
    updateStatus(tabId);
});

chrome.tabs.onCreated.addListener(function(tab) {
    chrome.browserAction.setBadgeText({text: "off"});
    updateStatus(tab.id);
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
    if (typeof(response) == 'undefined' || !response.hasOwnProperty("enabled")) {
        chrome.browserAction.setBadgeText({text: "off"});
    } else {
        if ( response.enabled ) {
            console.log("aleksi plugin enabled");
            chrome.browserAction.setBadgeText({text: "on"});
        } else {
            console.log("aleksi plugin disabled");
            chrome.browserAction.setBadgeText({text: "off"});
        }
    }
}
function login(callback) {
    authUrl = settings.authUrl;
    chrome.identity.launchWebAuthFlow({'url': authUrl, 'interactive': true}, function (redirectUrl) {
        chrome.cookies.get({"url": authUrl, "name": "session_key"}, function(cookie) {
                a = cookie.value;
            }
        });
        if (redirectUrl) {
            logger.debug('launchWebAuthFlow login successful: ', redirectUrl);
            var parsed = parse(redirectUrl.substr(chrome.identity.getRedirectURL("oauth2").length + 1));
            token = parsed.access_token;
            logger.debug('Background login complete');
            return callback(redirectUrl); // call the original callback now that we've intercepted what we needed
        } else {
            logger.debug("launchWebAuthFlow login failed. Is your redirect URL (" + chrome.identity.getRedirectURL("oauth2") + ") configured with your OAuth2 provider?");
            return (null);
        }
    });
}
function enable(tab) {
    chrome.tabs.sendMessage(tab.id,{action: 'enable'}, updateIconState);
    login(function(redirectUrl) { return });
}
function toggle(tab) {
    chrome.tabs.sendMessage(tab.id,{action: 'getStatus'}, function(response) {
        if (typeof(response) != 'undefined') {
            if (response.initialized) {
                console.log("aleksi plugin initialized");
                if (!response.enabled) {
                    enable(tab);
                    //activate(tab);
                } else {
                    chrome.tabs.sendMessage(tab.id,{action: 'disable'}, updateIconState);
                }
            } else {
                console.log("initializing aleksi plugin");
                chrome.tabs.sendMessage(tab.id,{action: 'initialize', url: tab.url}, function(response) {
                    if (response.initialized) {
                        console.log("aleksi plugin initialized. enabling aleksi plugin");
//                        chrome.tabs.sendMessage(tab.id,{action: 'enable'}, updateIconState );
                        enable(tab);
                        /*
                        chrome.runtime.sendMessage({
                            action: 'activateOCR',
                            tab: tab
                        }, function(response) {});
                        */
                    }
                });
            }
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

