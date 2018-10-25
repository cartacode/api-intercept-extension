// Create a nessage connection
var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if (typeof (msg) !== "string") {
    }
  });

});


// get data from storage
chrome.storage.sync.get("artist", function(obj) {
});