let color = '#0f0f3d';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %ccolor', `color: ${color}`);
});

chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = chrome.extension.getURL("main.html");
    chrome.tabs.create({ url: newURL });
});






