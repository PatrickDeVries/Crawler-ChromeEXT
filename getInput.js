let inputButton = document.getElementById("inputButton");

inputButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let baseSite = document.getElementById("baseSite");
    console.log("baseSite: " + baseSite.value);
    let origin = baseSite.value;
    chrome.storage.sync.set({'baseSite':origin}, function() {
        console.log("baseSite:" + origin);
    });
  });