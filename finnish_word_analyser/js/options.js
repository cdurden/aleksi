window.addEventListener("load", loadOptions);

//var defaultWordsUri = "http://localhost/aleksi/sanat/";
var defaultWordsUri = "http://www4.ncsu.edu/~cldurden/aleksi/sanat/";
var defaultDisableLinks = true;

function loadOptions() {
    var wordsUri;
    var disableLinks;
    chrome.storage.sync.get({'wordsUri': defaultWordsUri, 'disableLinks': defaultDisableLinks}, function(result) { 
        wordsUri = result.wordsUri; 
        disableLinks = result.disableLinks;
        var wordsUriInput = document.getElementById("wordsUri");
        wordsUriInput.value = wordsUri;

        var disableLinksInput = document.getElementById("disableLinks");
        disableLinksInput.checked = disableLinks;
        saveOptions();
    });
//    chrome.storage.sync.get({'disableLinks': defaultDisableLinks}, function(result) { disableLinks = result.disableLinks; });
    //var wordsUri = localStorage["wordsUri"];

    // valid colors are red, blue, green and yellow
//    if (wordsUri == undefined) {
//        wordsUri = defaultWordsUri;
//    }

}

function saveOptions() {
    var wordsUriInput = document.getElementById("wordsUri");
    var wordsUri = wordsUriInput.value;
    chrome.storage.sync.set({'wordsUri': wordsUri});

    var disableLinksInput = document.getElementById("disableLinks");
    var disableLinks = disableLinksInput.checked;
    chrome.storage.sync.set({'disableLinks': disableLinks});
}

function eraseOptions() {
//    localStorage.removeItem("wordsUri");
    chrome.storage.sync.remove('wordsUri');
    chrome.storage.sync.remove('disableLinks');
    location.reload();
}

window.onload=function(){
    document.getElementById("saveOptions").addEventListener("click",saveOptions);
    document.getElementById("eraseOptions").addEventListener("click",eraseOptions);
}
