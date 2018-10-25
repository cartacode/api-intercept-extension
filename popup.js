var videoUrls = [];
var resultElement = document.getElementById('results');

// Create a nessage connection
var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if (typeof (msg) !== "string") {
    	switch(msg.type) {
    		case "video":
    			addVideoUrlToBox(msg.data);
    			break;

    		default:
    			console.log('default case: ', msg);
    			break;
    	}
    }
  });

});

// get data from storage
chrome.storage.sync.get("tidal_video", function(obj) {
	if (obj && obj.tidal_video) {
		videoUrls = obj.tidal_video.split(',');
	}

	for (var i = 0; i < videoUrls.length; i += 1) {
		var inputElement = document.createElement('input');

		inputElement.value = videoUrls[i];
		resultElement.appendChild(inputElement);
	}
});

var clearButtonElement = document.getElementById('clear');

// clearButtonElement.addEventListner('click', function () {
// 	console.log('clear button clicked');
// 	chrome.storage.sync.remove('tidal_video', function () {});
// })

clearButtonElement.onclick = function () {
	console.log('clear button clicked');
	chrome.storage.sync.set({ 'tidal_video': '' }, function () {
		resultElement.innerHTML = "";
	});
}