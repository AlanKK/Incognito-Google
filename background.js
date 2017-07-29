function findLastIncognito(windows) {
    var win = 0;
    for(var i = windows.length - 1; i >= 0; i--)
        if (windows[i].incognito) {
            // This extension can't see incognito windows unless it is running in incognito
            // mode.  When that is enabled, we need to prevent tab open spam.  
            var tabs = windows[i].tabs;
            for (var j = tabs.length - 1; j >= 0; j--) {
                if (tabs[j].id == tabId) return -1;
            }
            win = windows[i];
        }
    return win;
}

function openGoogleLink(thisUrl, putInThisWindow) {
    if (putInThisWindow == -1) {
        return;
    } else if (putInThisWindow == 0) {
        console.log("No existing incog window found.");
        chrome.windows.create({ url: thisUrl, incognito: true});
    }
    else {
        console.log("Found existing incog window.");
        chrome.tabs.create({ windowId: putInThisWindow.id, url: thisUrl, selected: false});
    }
}

var tabId = -1;
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var url = details['url'];
        tabId = details['tabId'];

		// Don't redirect maps searches at maps.google.com
		if (url.indexOf('search?tbm=map') !== -1) return;
		
        if (url.substr(0, 1) === '/' && url.substr(0, 2) !== '//')
          url = 'https://www.google.com' + url;

        chrome.windows.getAll({ "populate": true }, function(windows) {
            openGoogleLink(url, findLastIncognito(windows));
            return { cancel: true };
        });
        chrome.tabs.update(tabId, { url: "https://www.google.com/" });
    },
    { urls: ["*://google.com/search?*", "*://www.google.com/search?*"] },
    ["blocking"]
);

