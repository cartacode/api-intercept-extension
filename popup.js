// Create a nessage connection
var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
});

port.postMessage({ type: "getTime", time: time });

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if (typeof (msg) !== "string") {
    }
  });

});


// get data from storage
chrome.storage.sync.get("artist", function(obj) {
  document.getElementById('artist-name').textContent = obj.artist;
});

chrome.storage.sync.get("title", function(obj) {
  document.getElementById('title').textContent = obj.title;
});