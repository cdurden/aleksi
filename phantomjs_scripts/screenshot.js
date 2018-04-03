var page = require('webpage').create(),
  system = require('system'),
  t, address;
page.viewportSize = { width: 1024, height: 768 };
//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1024, height: 768 };

if (system.args.length === 1) {
  //console.log('Usage: loadspeed.js <some URL> <encoding> <output file>');
  console.log('Usage: loadspeed.js <some URL> <output file>');
  phantom.exit();
}

t = Date.now();
address = system.args[1];
//encoding = system.args[2];
//output = system.args[3];
output = system.args[2];

//var settings = {
//    encoding: encoding
//}
//page.open(address, settings, function(status) {
page.open(address, function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    page.render(output);
  }
  phantom.exit();
});
