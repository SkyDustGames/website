import { auth, database, module } from "./firebase.js";
import params from "./query.js";

if (!params.p || !params.c) window.location.replace("/blog");

const snapshot = await module.database.get(module.database.ref(database, `/posts/${params.c}`));
const posts = snapshot.val();

if (!posts) window.location.replace("/blog");

let post;
for (let i = 0; i < posts.length; i++) {
    if (posts[i].name == params.p) {
        post = posts[i];
        break;
    }
}

if (!post) window.location.replace("/blog");

document.getElementById("image").src = post.image;
document.getElementById("title").innerHTML = `${post.name}<br><i class="tagline">${post.tagline}</i>`;
document.getElementById("content").innerText = post.content;
document.querySelector(".skeleton").classList.remove("skeleton");

const commentsDiv = document.querySelector(".comments");
commentsDiv.innerHTML = auth.currentUser ? `<div class="comment">
    <textarea class="write" placeholder="Write a comment..."></textarea>
    <button>Post</button>
</div>` : "";

const comments = (post.comments || []).sort((a,b) => (a.likes - a.dislikes) - (b.likes - b.dislikes));
comments.forEach(async comment => {
    let data;
    const snapshot = await module.database.get(module.database.ref(database, `/users/${comment.uid}`)).catch(() => {
        data = { name: "Private user", photoURL: "/assets/anonymous.png" };
    });

    if (snapshot) data = snapshot.val();

    const div = document.createElement("div");
    div.className = "comment";

    const credentials = document.createElement("div");
    credentials.className = "credentials";

    const img = document.createElement("img");
    img.src = data.photoURL;
    img.className = "profilePicture";
    credentials.append(img);

    const username = document.createElement("p");
    username.innerHTML = `<b>${data.name}</b>`;
    credentials.append(username);

    div.append(credentials);

    const p = document.createElement("p");
    p.innerText = comment.content;
    div.append(p);

    const bottom = document.createElement("div");
    bottom.className = "bottom";

    const like = document.createElement("button");
    like.addEventListener("click", () => like(comment));
    like.innerHTML = `<img src="/assets/like.png" width="32px" height="32px">${comment.likes}`;
    bottom.append(like);

    const dislike = document.createElement("button");
    dislike.addEventListener("click", () => dislike(comment));
    dislike.innerHTML = `<img src="/assets/dislike.png" width="32px" height="32px">${comment.dislikes}`;
    bottom.append(dislike);

    div.append(bottom);

    commentsDiv.append(div);
});

document.title = `SkyDust - ${post.name}`;