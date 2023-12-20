import { database, storage, auth, module } from "./firebase.js";

/* PAGE NAVIGATION */
function changePage(href) {
  const selected = document.querySelector("nav a.selected");
  if (selected) selected.classList.remove("selected");

  const a = document.querySelector("nav a[href=" + href + "]");
  if (a) a.classList.add("selected");

  const page = document.querySelector(".page.selected");
  page.classList.remove("selected");

  document.querySelector(`.page#${href}`).classList.add("selected");
}

const links = document.querySelectorAll("a");
links.forEach(link => {
  const href = link.getAttribute("href");
  if (href.startsWith("/"))
    return;

  link.addEventListener("click", e => {
    e.preventDefault();
    changePage(href);
  });
});

/* MANAGE POSTS */
const postsRef = module.database.ref(database, "posts");
const postsDiv = document.getElementById("allPosts");
let categories;
module.database.get(postsRef).then(snapshot => {
  categories = snapshot.val();
  for (const categoryName in categories) {
    const category = categories[categoryName];
    category.forEach((post, index) => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `<h1>${post.name}</h1>
        <p class="category">${categoryName.toUpperCase()}</p>
        <p>${post.tagline}</p>`;
      
      const editButton = document.createElement("button");
      editButton.innerText = "Edit";
      editButton.addEventListener("click", () => {
        writeForm.querySelector("[name=title]").value = post.name;
        writeForm.querySelector("[name=tagline]").value = post.tagline;
        writeForm.querySelector("[name=category]").value = categoryName;
        writeForm.querySelector("[name=preview]").src = post.image;
        writeForm.querySelector("[name=content]").value = post.content;
        changePage("write");
      });
      div.appendChild(editButton);
      
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click", async () => {
        var cat = await module.database.get(module.database.ref(database, `/posts/${categoryName}`));
        if (cat == null) cat = []
        else cat = cat.val();

        cat.splice(cat.indexOf(post), 1);

        await module.database.set(module.database.ref(database, `/posts/${categoryName}`), cat);
        await module.storage.deleteObject(module.storage.ref(storage, post.imageRef));
        postsDiv.removeChild(div);
      });
      div.append(deleteButton);

      postsDiv.appendChild(div);

      if (post.comments)
        addComments(post, index, categoryName);
    });
  }
});

/* WRITE POSTS */
const writeForm = document.getElementById("writePost");
writeForm.addEventListener("submit", async e => {
  e.preventDefault();

  let title = writeForm.querySelector("[name=title]");
  let tagline = writeForm.querySelector("[name=tagline]");
  let category = writeForm.querySelector("[name=category]");
  let preview = writeForm.querySelector("[name=preview]");
  let file = writeForm.querySelector("[name=image]");
  let content = writeForm.querySelector("[name=content]");

  if (!title.value || !tagline.value || !category.value || !content.value || (!file.files[0] && !preview.src)) {
    console.error("All inputs need to be filled.");
    return;
  }

  var cat = await module.database.get(module.database.ref(database, `/posts/${category.value}`));
  if (cat == null) cat = [];
  else cat = cat.val() || [];

  var prev = { imageRef: null }
  var replace = -1;
  cat.forEach((post, i) => {
    if (post.name == title.value) {
      replace = i;
      prev = post;
    }
  });
  if (replace < 0) replace = cat.length;

  var imgURL = preview.src;
  var imgRef = prev.imageRef;
  if (file.files[0]) {
    imgRef = `/posts/${category.value}-${Date.now()}`;
    const ref = module.storage.ref(storage, imgRef);
    await module.storage.uploadBytes(ref, file.files[0]);
    imgURL = await module.storage.getDownloadURL(ref);
  }

  var data = {
    name: title.value,
    tagline: tagline.value,
    image: imgURL,
    imageRef: imgRef,
    content: content.value
  }

  if (prev.comments)
    data.comments = prev.comments;

  await module.database.set(module.database.ref(database, `/posts/${category.value}/${replace}`), data);
  changePage("manage");
});

/* MANAGE COMMENTS */
const commentsDiv = document.getElementById("allComments");
function addComments(post, index, category) {
  post.comments.forEach(async (comment, i) => {
    const user = (await module.database.get(module.database.ref(database, `/users/${comment.uid}`))).val();

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `<p class="category">${post.name}/${category.toUpperCase()}</p>
    <p class="picture"><img class="profile" src="${user.photoURL}">${user.name} (${comment.uid})</p>
    <p>${comment.content}</p>`;

    const button = document.createElement("button");
    button.innerText = "Delete";
    button.addEventListener("click", async () => {
      post.comments.splice(i, 1);
      await module.database.set(module.database.ref(database, `/posts/${category}/${index}/comments`), post.comments);
      div.remove();
    });
    div.append(button);

    commentsDiv.appendChild(div);
  });
}

/* MANAGE ACCOUNTS */
const usersRef = module.database.ref(database, "/users");
const usersDiv = document.getElementById("allAccounts");

module.database.get(usersRef).then(snapshot => {
  const users = snapshot.val();
  for (let uid in users) {
    const user = users[uid];

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `<p class="picture"><img class="profile" src="${user.photoURL}">${user.name} (${uid})</p>
    <p>${user.banned? "Banned" : user.public? "Public" : "Private"} account</p>`;
    usersDiv.appendChild(div);

    const input = document.createElement("input");
    input.placeholder = "Ban reason...";
    input.value = user.banned || "";
    div.append(input);

    if (user.banned && user.appeal) {
      const i = document.createElement("i");
      i.innerHTML = `User appealed: ${user.appeal}`;
      div.append(i);
    }

    const button = document.createElement("button");
    button.innerText = user.banned? "Unban" : "Ban";
    button.addEventListener("click", async () => {
      var reason = user.banned? null : input.value || "Unspecified reason";
      await module.database.set(module.database.ref(database, `/users/${uid}/banned`), reason);
      if (reason != null)
        await module.database.set(module.database.ref(database, `/users/${uid}/public`), true);
      else if (user.appeal)
      await module.database.set(module.database.ref(database, `/users/${uid}/appeal`), null);
    });
    div.append(button);
  }
});