function findLastIncognito(windows) {
    var win = false;
    for(var i = windows.length - 1; i >= 0; i--)
        if (windows[i].incognito) win = windows[i];
    return win;
}

function openGoogleLink(thisUrl, putInThisWindow) {
    if (putInThisWindow)
        chrome.tabs.create({ windowId: putInThisWindow.id, url: thisUrl, selected: false});
    else
        chrome.windows.create({ url: thisUrl, incognito: true});
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var url = details['url'];
        var tabId = details['tabId'];

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

