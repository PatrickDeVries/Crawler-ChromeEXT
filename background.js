let color = '#040774';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %ccolor', `color: ${color}`);
});