let jumpURL = document.getElementById("jumpURL");
let jumpText = document.getElementById("jumpText");
let jumpGraph = document.getElementById("jumpGraph");

jumpURL.addEventListener("click", async () => {
  jumpURL.classList.add("active");
  jumpGraph.classList.remove("active");
  jumpText.classList.remove("active");

  document.getElementById("baseSite").scrollIntoView();
});

jumpGraph.addEventListener("click", async () => {
  jumpURL.classList.remove("active");
  jumpGraph.classList.add("active");
  jumpText.classList.remove("active");

  document.getElementById("graph").scrollIntoView();
});

jumpText.addEventListener("click", async () => {
  jumpURL.classList.remove("active");
  jumpGraph.classList.remove("active");
  jumpText.classList.add("active");

  document.getElementById("currPage").scrollIntoView();
});