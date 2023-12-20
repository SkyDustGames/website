import { auth, database, module } from "./firebase.js";

function getParameter(index) {
  const afterBlog = window.location.href.split("/blog/")[1];
  const array = afterBlog.split("/");

  return array[index];
}

const category = getParameter(0);
const postName = decodeURI(getParameter(1));

const snapshot = await module.database.get(module.database.ref(database, `/posts/${category}`));
const posts = snapshot.val();

if (!posts) window.location.replace("/blog");

let post;
let postIndex;
for (let i = 0; i < posts.length; i++) {
  if (posts[i].name == postName) {
    post = posts[i];
    postIndex = i;
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
  <textarea id="writeComment" class="write" placeholder="Write a comment..."></textarea>
  <button id="postComment">Post</button>
</div>` : "";

const comments = (post.comments || []).sort((a,b) => (a.likes - a.dislikes) - (b.likes - b.dislikes));
let i = 0;

async function like(comment, buttons, index) {
  const ref = module.database.ref(database, `/posts/${category}/${postIndex}/comments/${index}`);

  if (comment.likes.includes(auth.currentUser.uid)) {
    comment.likes.splice(comment.likes.indexOf(auth.currentUser.uid), 1);
    buttons[0].innerHTML = `<img src="/like.png" width="32px" height="32px">${comment.likes.length}`;

    await module.database.set(ref, comment);
    return;
  }

  if (comment.dislikes.includes(auth.currentUser.uid)) {
    comment.dislikes.splice(comment.dislikes.indexOf(auth.currentUser.uid), 1);
    buttons[1].innerHTML = `<img src="/dislike.png" width="32px" height="32px">${comment.dislikes.length}`;
  }

  comment.likes.push(auth.currentUser.uid);
  buttons[0].innerHTML = `<img src="/like.png" width="32px" height="32px">${comment.likes.length}`;

  await module.database.set(ref, comment);
}

async function dislike(comment, buttons, index) {
  const ref = module.database.ref(database, `/posts/${category}/${postIndex}/comments/${index}/dislikes`);

  if (comment.dislikes.includes(auth.currentUser.uid)) {
    comment.dislikes.splice(comment.dislikes.indexOf(auth.currentUser.uid), 1);
    buttons[1].innerHTML = `<img src="/dislike.png" width="32px" height="32px">${comment.dislikes.length}`;

    await module.database.set(ref, comment);
    return;
  }

  if (comment.likes.includes(auth.currentUser.uid)) {
    comment.likes.splice(comment.likes.indexOf(auth.currentUser.uid), 1);
    buttons[0].innerHTML = `<img src="/like.png" width="32px" height="32px">${comment.likes.length}`;
  }

  comment.dislikes.push(auth.currentUser.uid);
  buttons[1].innerHTML = `<img src="/dislike.png" width="32px" height="32px">${comment.dislikes.length}`;

  await module.database.set(ref, comment.dislikes);
}

comments.forEach(async comment => {
  let data;
  const snapshot = await module.database.get(module.database.ref(database, `/users/${comment.uid}`)).catch(() => {
    data = { name: "Private user", photoURL: "/anonymous.png" };
  });

  if (snapshot) data = snapshot.val();
  if (data.banned) return;

  comment.likes = comment.likes || [];
  comment.dislikes = comment.dislikes || [];

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

  if (auth.currentUser) {
    const bottom = document.createElement("div");
    bottom.className = "bottom";

    let j = i;

    const likeBtn = document.createElement("button");
    const dislikeBtn = document.createElement("button");

    likeBtn.addEventListener("click", () => like(comment, [likeBtn, dislikeBtn], j));
    likeBtn.innerHTML = `<img src="/like.png" width="32px" height="32px">${comment.likes.length}`;
    bottom.append(likeBtn);

    dislikeBtn.addEventListener("click", () => dislike(comment, [likeBtn, dislikeBtn], j));
    dislikeBtn.innerHTML = `<img src="/dislike.png" width="32px" height="32px">${comment.dislikes.length}`;
    bottom.append(dislikeBtn);

    div.append(bottom);
  }

  commentsDiv.append(div);

  i++;
});

document.title = `SkyDust - ${post.name}`;

const postComment = document.getElementById("postComment");
if (!postComment); else

postComment.addEventListener("click", async () => {
  const content = document.getElementById("writeComment").value;
  if (!content) return;

  const comment = {
    content: content,
    uid: auth.currentUser.uid,
    likes: [],
    dislikes: []
  };

  comments.push(comment);

  let data;
  const snapshot = await module.database.get(module.database.ref(database, `/users/${comment.uid}`)).catch(() => {
    data = { name: "Private user", photoURL: "/anonymous.png" };
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

  let j = comments.length - 1;

  const likeBtn = document.createElement("button");
  const dislikeBtn = document.createElement("button");

  likeBtn.addEventListener("click", () => like(comment, [likeBtn, dislikeBtn], j));
  likeBtn.innerHTML = `<img src="/like.png" width="32px" height="32px">0`;
  bottom.append(likeBtn);

  dislikeBtn.addEventListener("click", () => dislike(comment, [likeBtn, dislikeBtn], j));
  dislikeBtn.innerHTML = `<img src="/dislike.png" width="32px" height="32px">0`;
  bottom.append(dislikeBtn);

  div.append(bottom);

  commentsDiv.append(div);

  const ref = module.database.ref(database, `/posts/${category}/${postIndex}/comments`);
  await module.database.set(ref, comments);
});