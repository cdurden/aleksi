// Standard Google Universal Analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ 
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), 
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) 
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here 

ga('create', 'UA-140774445-1', 'auto'); 
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200 
ga('require', 'displayfeatures'); 
ga('send', 'pageview', 'background.js');

function track_analysis_request(result) {
  ga('send', 
      {
            hitType: 'event',
            eventCategory: 'Analyse',
            eventAction: 'Requested',
            eventLabel: window.location.href,
      });
}
function track_analysis_success(result) {
  ntr = result['lemmas'].map(function(lemma) { return lemma['translations'].length }).reduce(function(s,k) { return s+k });
  ntags = result['tags'].length;
  ga('send', 
      {
            hitType: 'event',
            eventCategory: 'Analyse',
            eventAction: 'FoundTranslations',
            eventLabel: result['wordform'],
            eventValue: ntr
      });
  ga('send', 
      {
            hitType: 'event',
            eventCategory: 'Analyse',
            eventAction: 'FoundTags',
            eventLabel: result['wordform'],
            eventValue: ntags
      });
};
function track_analysis_error(errorText) {
  ga('send', 
      {
            hitType: 'event',
            eventCategory: 'Analyse',
            eventAction: 'Error',
            eventLabel: errorText,
      });
};
function track_pin_event(e) {
  ga('send', 'event', 'pin', 'pin_lemma');
};
