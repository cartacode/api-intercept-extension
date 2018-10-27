var videoUrls = '';

var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
});

port.postMessage({
    type: 'video1',
    data: videoUrls
})

chrome.storage.sync.get("tidal_video", function(obj) {
    console.log('ssss: ', obj.tidal_video)
	if (obj && obj.tidal_video) {
		videoUrls = obj.tidal_video;
	}
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
      	new chrome.declarativeContent.PageStateMatcher({
	        css: ["body"],
	      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onConnect.addListener(function(port) {
	
	port.onMessage.addListener(function(msg) {
        chrome.storage.sync.get("tidal_video", function(obj) {
            console.log('DF: ', obj);
        })
        if (msg.type && msg.type == 'video_clear') {
            videoUrls = '';
        }
	});

});

function coreGetApi(url) {
	return new Promise(function (resolve, reject) {
		
		fetch(url)
		.then(function(response) {

		  if (response.status >= 400 && response.status < 500) {
		    return response.text()
		    .then((responseText) => {
		      reject(responseText)
		    });
		    
		  } else {
		    response.json()
		    .then((responseText) => {
		      resolve(responseText);
		    });
		  }

		})
		.catch((err) => {
		  reject(err);
		});
	
	});
}

(function() {
    const tabStorage = {};
    const networkFilters = {
        urls: [
            "*://*.video.tidal.com/*"
        ]
    };

    chrome.webRequest.onBeforeRequest.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }

        tabStorage[tabId].requests[requestId] = {
            requestId: requestId,
            url: details.url,
            startTime: details.timeStamp,
            status: 'pending'
        };
    }, networkFilters);

    chrome.webRequest.onCompleted.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }

        const request = tabStorage[tabId].requests[requestId];

        Object.assign(request, {
            endTime: details.timeStamp,
            requestDuration: details.timeStamp - request.startTime,
            status: 'complete'
        });

        // chrome.storage.sync.set({ "tidal_video": videoUrls }, function() {
        //     console.log('complete: ', request, videoUrls);
        // });
        
        if (
        	request.url.indexOf('master_all.m3u') > -1
        	&& request.status == "complete"
        ) {
        	if (videoUrls.indexOf(request.url.split('?')[0]) == -1) {
                if (videoUrls === '') {
                    videoUrls = request.url
                } else {
                    videoUrls += ',' + request.url;
                }

                chrome.storage.sync.set({ "tidal_video": videoUrls }, function() {
                    console.log('complete: ', request, videoUrls);
                });
            }
        }
        

    }, networkFilters);

    chrome.webRequest.onErrorOccurred.addListener((details)=> {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }

        const request = tabStorage[tabId].requests[requestId];
        Object.assign(request, {
            endTime: details.timeStamp,           
            status: 'error',
        });
    }, networkFilters);

    chrome.tabs.onActivated.addListener((tab) => {
        const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
        if (!tabStorage.hasOwnProperty(tabId)) {
            tabStorage[tabId] = {
                id: tabId,
                requests: {},
                registerTime: new Date().getTime()
            };
        }
    });
    chrome.tabs.onRemoved.addListener((tab) => {
        const tabId = tab.tabId;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
        tabStorage[tabId] = null;
    });
}());