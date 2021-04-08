async function sendQuery(url) {
    let result = await makeRequest("GET", url);
    console.log("result", result);
    return result;
}

function func(n) {
    return new Promise(function(resolve) {
        var arr = []
        arr.push(n);
        arr.push(n*2);
        arr.push(n*3);
        resolve(arr);
    });
}

button = document.getElementById("but");

button.addEventListener("click", async () => {
    const result = await Promise.resolve(func(3));
    console.log(result);
});