let buildButton = document.getElementById("buildButton");

buildButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let baseSite = '';
    chrome.storage.sync.get("baseSite", function (obj) {  
        console.log("Got baseSite:", obj.baseSite);
        baseSite = obj.baseSite; 
        var xhr = new XMLHttpRequest();
        document.getElementById("buildError").innerText = "";
        document.getElementById("currPage").innerText = "Current page: (" + baseSite + ")";
        try {
            xhr.open("GET", baseSite);
            xhr.send();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let pageText = this.responseText;
                    let expr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
                    pageText = pageText.replace(expr, "script\n");
                    document.getElementById("treeDiv").innerText = pageText;
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
                    document.getElementById("buildError").innerText = "Error loading site, try another URL";
                    document.getElementById("treeDiv").innerHTML = "Nothing here";
                }

            };
        } 
        catch {
            console.log("Error loading site");
            document.getElementById("buildError").innerText = "Error loading site, try another URL";
            document.getElementById("treeDiv").innerHTML = "Nothing here";
        }
    });
  });