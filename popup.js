var videoUrls = [];
var strVideoUrl = '';
var resultElement = document.getElementById('results');

function addVideoUrlToBox(data) {
    console.log('VideoBox: ', data)
    // get data from storage
    chrome.storage.sync.get("tidal_video", function(obj) {
        console.log('obj: ', obj)
        if (obj && obj.tidal_video) {
            videoUrls = obj.tidal_video.split(',');
        }

        for (var i = 0; i < videoUrls.length; i += 1) {
            var inputElement = document.createElement('input');

            inputElement.value = videoUrls[i];
            resultElement.appendChild(inputElement);
        }
    });
}

// Create a nessage connection
var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
});

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log('mesg: ', msg)
    if (typeof (msg) !== "string") {
      switch(msg.type) {
        case "video":
          // addVideoUrlToBox(msg.data);
          break;

        case "video_done":
          document.getElementById('loading').style.display = 'none';

        default:
          console.log('default case: ', msg);
          break;
      }
    }
  });

});

chrome.storage.sync.get("tidal_video", function(obj) {
  console.log('obj: ', obj)
  if (obj && obj.tidal_video) {
    strVideoUrl = obj.tidal_video;
    videoUrls = obj.tidal_video.split(',');
  }

  for (var i = 0; i < videoUrls.length; i += 1) {
    var divElement = document.createElement('div');

    divElement.className = 'tidal-item';

    resultElement.appendChild(divElement);

    var labelElement = document.createElement('label');
    var inputElement = document.createElement('input');
    var clipboardElement = document.createElement('button');
    var deleteElement = document.createElement('button');

    labelElement.textContent = i + 1;
    divElement.appendChild(labelElement);
    
    inputElement.value = videoUrls[i];
    inputElement.className = 'inputUrl-' + i;
    inputElement.id = 'inputUrl-' + i;
    divElement.appendChild(inputElement);

    clipboardElement.innerHTML = 'Copy';
    clipboardElement.className = 'copy-' + i;
    clipboardElement.id = 'copy-' + i;
    clipboardElement.addEventListener('click', function(evt) {
      var copyText = document.getElementById(evt.target.id.replace('copy', 'inputUrl'));
      copyText.select();

      /* Copy the text inside the text field */
      document.execCommand("copy");
    });
    divElement.appendChild(clipboardElement);

    deleteElement.innerHTML = 'Delete';
    deleteElement.className = 'delete-' + i;
    deleteElement.id = 'delete-' + i;
    deleteElement.addEventListener('click', function(evt) {
      var newUrl = strVideoUrl.replace(document.getElementById(evt.target.id.replace('delete', 'inputUrl')).value, '').replace(',,', ',');
      if (newUrl[0] === ',') {
        newUrl = newUrl.slice(1);
      }
      chrome.storage.sync.set({ 'tidal_video': newUrl }, function () {
        strVideoUrl = newUrl;
        document.getElementById(evt.target.id.replace('delete', 'inputUrl')).value = '';
      });
      
    });
    divElement.appendChild(deleteElement);

  }
});

chrome.storage.sync.get("loading", function(obj) {
  console.log(obj.loading)
  if (obj.loading) {
    if (obj.loading === '0') {
      document.getElementById('loading').style.display = 'none';
    } else {
      document.getElementById('loading').style.display = 'block';
    }
  } else {
    document.getElementById('loading').style.display = 'none';
  }
});

var clearButtonElement = document.getElementById('clear');

clearButtonElement.onclick = function () {
  chrome.storage.sync.set({ 'tidal_video': '' }, function () {
    resultElement.innerHTML = "";
  });

  chrome.storage.sync.set({ 'loading': '0' }, function () {});
  document.getElementById('loading').style.display = 'none';

  var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
  });

  port.postMessage({
      type: 'video_clear',
      data: ''
  });
}

var downloadAppElement = document.getElementById('downloadApp');

downloadAppElement.onclick = function () {
  var inputUrl = document.getSelection().toString();
  document.getElementById('loading').style.display = 'block';
  chrome.storage.sync.set({ 'loading': '1' }, function () {});

  var port = chrome.runtime.connect({
    name: "tidal-api-intercept"
  });

  port.postMessage({
      type: 'video_start',
      data: inputUrl
  });
}