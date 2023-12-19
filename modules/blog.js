import { database, module } from "./firebase.js";

const posts = document.getElementById("posts");
function addPost(post, category) {
  posts.innerHTML += `
<a class="post${post.important ? " important": ""}" href="/blog/${category}/${encodeURI(post.name)}">
  <img src="${post.image}">
  <div>
    <h2>${post.name}</h2>
    <p>${post.tagline}</p>
  </div>
</a>
  `;
}

const c = window.location.href.split("/blog/")[1];

function formatProperString(input) {
  return (input[0].toUpperCase() + input.substring(1)).replaceAll("-", " ");
}

const topics = document.querySelector(".topics");

module.database.get(module.database.ref(database, "/posts")).then(snapshot => {
  const categories = snapshot.val() || {};
  posts.innerHTML = "";

  topics.className = "topics";
  topics.innerHTML = `<a href="/blog/">All</a>`;

  for (var category in categories) {
    topics.innerHTML += `<a href="/blog/${category}">${formatProperString(category)}</a>`;
    if (!c || category == c)
      categories[category].forEach((post) => addPost(post, category));
  }
});

if (c) document.title = "SkyDust - " + formatProperString(c);