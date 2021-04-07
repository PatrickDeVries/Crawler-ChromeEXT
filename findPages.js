function getLinks(url) {
    return new Promise(resolve => {
        var urls = [];
        var xhr = new XMLHttpRequest();
        try {
            xhr.open("GET", url);
            xhr.send();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let pageText = this.responseText;
    
                    //remove scripts to be safe
                    let expr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
                    pageText = pageText.replace(expr, "script removed for security");
    
                    // find all urls
                    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                    let regURL = RegExp(expression, "g")
    
                    var result;
                    while((result = regURL.exec(this.responseText)) !== null) {
                        
                        // Try to correct urls with script tags attached
                        var url = result[0];
                        if (url.includes('"></script>')) {
                            url = url.slice(0, -11);
                        }
                        // check for bad file types
                        const badEnds = [".js", ".css"]
                        let badURL = false;
                        badEnds.forEach(ending => {
                            if (url.includes(ending)) {
                                badURL = true;
                                return;
                            }
                        });
                        // double check for extra html tags in url
                        if (url.includes("<") || url.includes(">")) {
                            badURL = true;
                        }
                        if (badURL) {
                            continue;
                        }
                        // make sure to have http
                        if (url.slice(0, 3) == "www") {
                            url = "http://" + url;
                        }
    
                        urls.push(url);
                        // console.log(url);
                    }
                    console.log("urls", urls);
                }
                else if (this.readyState == 4) {
                    console.log("Error loading site");
                }
            };
        } 
        catch {
            console.log("Error loading site");
        }
        resolve(urls);
    });
}

// function that will load html and urls from a site 
function processSite(urlLoc, insertId, errorId) {
    let baseSite = '';
    chrome.storage.sync.get(urlLoc, function (obj) {  
        console.log("Got baseSite:", obj.url, "from", urlLoc, "obj=", obj);
        baseSite = obj[urlLoc]["url"]; 
        var xhr = new XMLHttpRequest();
        document.getElementById(errorId).innerText = "";

        try {
            xhr.open("GET", baseSite);
            xhr.send();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let pageText = this.responseText;

                    //remove scripts to be safe
                    let expr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
                    pageText = pageText.replace(expr, "script removed for security");

                    document.getElementById(insertId).innerText = pageText;

                    // find all urls
                    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                    let regURL = RegExp(expression, "g")

                    var result;
                    while((result = regURL.exec(this.responseText)) !== null) {
                        
                        // Try to correct urls with script tags attached
                        var url = result[0];
                        if (url.includes('"></script>')) {
                            url = url.slice(0, -11);
                        }
                        // check for bad file types
                        const badEnds = [".js", ".css"]
                        let badURL = false;
                        badEnds.forEach(ending => {
                            if (url.includes(ending)) {
                                badURL = true;
                                return;
                            }
                        });
                        // double check for extra html tags in url
                        if (url.includes("<") || url.includes(">")) {
                            badURL = true;
                        }
                        if (badURL) {
                            continue;
                        }
                        // make sure to have http
                        if (url.slice(0, 3) == "www") {
                            url = "http://" + url;
                        }

                        // checks passed!


                        console.log(url);
                    }
                }
                else if (this.readyState == 4) {
                    console.log("Error loading site");
                    document.getElementById(errorId).innerText = "Error loading site, try another URL";
                    document.getElementById(insertId).innerHTML = "Nothing here";
                }

            };
        } 
        catch {
            console.log("Error loading site");
            document.getElementById(errorId).innerText = "Error loading site, try another URL";
            document.getElementById(insertId).innerHTML = "Nothing here";
        }
    });
}

let dissButton = document.getElementById("dissButton");

dissButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    processSite("currURL", "dissDiv", "dissError");
    
  });
