let color = '#0f0f3d';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %ccolor', `color: ${color}`);
});






