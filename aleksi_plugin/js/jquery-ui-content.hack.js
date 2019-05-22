$(function(){
    function fixcsspath(rules, folder){
        var path_prefix = chrome.extension.getURL('');
        var lookfor = 'url(';
        var ss = document.styleSheets;

        for (var j=0; j<rules.length; j++) {
            var b = rules[j].style['background-image'];
            var s;
            if (b && (s = b.indexOf(lookfor)) >= 0 ){
                s = s + lookfor.length;
                rules[j].style['background-image'] = b.replace(b.substr(s,b.indexOf(folder)-s), path_prefix);
            }   
        }
    };

    var ss = document.styleSheets;
//    alert(ss.length);

    for (var i=0; i<ss.length; i++) {
        var rules = ss[i].rules || ss[i].cssRules;
        alert(ss[i].href);
        if (rules!=null) {
//            alert(rules[0].selectorText);
            if (rules[0].selectorText!="#chrome-extention-relative-paths")
                continue;
            alert("found background-image css rules");
            fixcsspath(ss[i].rules, '/images/');
        }
    }
});
