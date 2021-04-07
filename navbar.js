let jumpURL = document.getElementById("jumpURL");
let jumpGraph = document.getElementById("jumpGraph");
let jumpDiss = document.getElementById("jumpDiss");

jumpURL.addEventListener("click", async () => {
  jumpURL.classList.add("active");
  jumpGraph.classList.remove("active");
  jumpDiss.classList.remove("active");

  window.scrollTo(0, 0);
});

jumpGraph.addEventListener("click", async () => {
  jumpURL.classList.remove("active");
  jumpGraph.classList.add("active");
  // jumpText.classList.remove("active");
  jumpDiss.classList.remove("active");

  document.getElementById("graphSec").scrollIntoView();
  window.scrollBy(0, -window.innerHeight/10);

});


jumpDiss.addEventListener("click", async () => {
  jumpURL.classList.remove("active");
  jumpGraph.classList.remove("active");
  jumpDiss.classList.add("active");

  document.getElementById("dissSec").scrollIntoView();
  window.scrollBy(0, -window.innerHeight/10);
});