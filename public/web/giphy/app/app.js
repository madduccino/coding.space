function findGiphy() {
  event.preventDefault();
  const query = document.getElementById("search-txt").value;
  const form = document.getElementById("find-giphy");

  const fullQuery =
    "https://api.giphy.com/v1/gifs/search?q=" +
    query +
    "&api_key=dc6zaTOxFJmzC&limit=25";
  console.log(fullQuery);
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    let results = document.getElementById("results");
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }
    if (xhr.readyState === 4 && xhr.status === 200) {
      let response = JSON.parse(xhr.responseText);

      response.data.map((item) => {
        let iframe = document.createElement("iframe");
        iframe.src = item.embed_url;
        results.appendChild(iframe);
      });
    }
  };
  xhr.open("GET", fullQuery, true);
  xhr.send();
}
