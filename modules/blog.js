import { database, module } from "./firebase.js";
import params from "./query.js";

const posts = document.getElementById("posts");
function addPost(post, category) {
    posts.innerHTML += `
<a class="post${post.important ? " important": ""}" href="/blog/post.html?p=${encodeURI(post.name)}&c=${category}">
    <img src="${post.image}">
    <div>
        <h2>${post.name}</h2>
        <p>${post.tagline}</p>
    </div>
</a>
    `;
}

module.database.get(module.database.ref(database, "/posts")).then(snapshot => {
    const categories = snapshot.val() || {};
    posts.innerHTML = "";
    for (var category in categories)
        categories[category].forEach((post) => addPost(post, category));
});