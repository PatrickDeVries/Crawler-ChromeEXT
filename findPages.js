
// function that will load a sites html and insert it into the disassembly section
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


// disassembly listener
let dissButton = document.getElementById("dissButton");

dissButton.addEventListener("click", async () => {
    processSite("currURL", "dissDiv", "dissError");
  });
