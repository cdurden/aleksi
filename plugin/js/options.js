window.addEventListener("load", load_options);

//var default_disable_links = true;

function load_options() {
    chrome.runtime.sendMessage({action: 'get_settings'}, function(response) {
        var settings = response;
        chrome.storage.sync.get(settings, function(result) { 
            for (var setting in settings) {
                //settings[setting] = result[setting];
                if (typeof result[setting] === "boolean") {
                    document.getElementById(setting+"_input").checked = result[setting];
                    //document.getElementById(setting+"_input").checked = settings[setting];
                } else {
                    document.getElementById(setting+"_input").value = result[setting];
                    //document.getElementById(setting+"_input").value = settings[setting];
                }
            }
            /*
            analyse_url = result.analyse_url; 
            disable_links = result.disable_links;
            var analyse_url_input = document.getElementById("analyse_url");
            analyse_url_input.value = analyse_url;
    
            var disable_links_input = document.getElementById("disable_links");
            disable_links_input.checked = disable_links;
            */
            save_options();
        });
    });
}

function save_options() {
    chrome.runtime.sendMessage({action: 'get_settings'}, function(response) {
        var settings = response;
        for (var setting in settings) {
            if (typeof settings[setting] === "boolean") {
                settings[setting] = document.getElementById(setting+"_input").checked;
            } else {
                settings[setting] = document.getElementById(setting+"_input").value;
            }
            chrome.storage.sync.set(settings);
            /*
            chrome.tabs.getCurrent(function(tab) {
                chrome.runtime.sendMessage({action: 'reload_options', tab: tab});
            });
            */
        }
        /*
        var analyse_url_input = document.getElementById("analyse_url");
        var analyse_url = analyse_url_input.value;
        chrome.storage.sync.set({'analyse_url': analyse_url});
    
        var disable_links_input = document.getElementById("disable_links");
        var disable_links = disable_links_input.checked;
        chrome.storage.sync.set({'disable_links': disable_links});
        */
    });
}

function erase_options() {
    chrome.runtime.sendMessage({action: 'get_settings'}, function(response) {
        var settings = response['settings'];
        for (var setting in settings) {
            chrome.storage.sync.remove(Object.keys(settings));
        }
        /*
        chrome.storage.sync.remove('analyse_url');
        chrome.storage.sync.remove('disable_links');
        */
        load_options();
        //location.reload();
    });
}

window.onload=function(){
    document.getElementById("save_options").addEventListener("click",save_options);
    document.getElementById("erase_options").addEventListener("click",erase_options);
}
