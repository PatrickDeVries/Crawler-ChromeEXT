let buildButton = document.getElementById("buildButton");

buildButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let baseSite = '';
    chrome.storage.sync.get("baseSite", function (obj) {  
        console.log("Got baseSite:", obj.baseSite);
        baseSite = obj.baseSite; 
        var xhr = new XMLHttpRequest();

        xhr.open("GET", baseSite);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("treeDiv").innerHTML = this.responseText;
                let regURL = RegExp("(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?", "g")

                // var arr = [this.responseText.matchAll(regURL)];
                // console.log(arr);    
                var result;
                while((result = regURL.exec(this.responseText)) !== null) {
                    console.log(result);
                }
                // for(var i=0; i<l.length; i++) {
                //     arr.push(l[i].href);
                // }
                // console.log(arr)

        }

    };    
    });

    

  });