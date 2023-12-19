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
module.database.get(postsRef).then(snapshot => {
  const categories = snapshot.val();
  for (const categoryName in categories) {
    const category = categories[categoryName];
    category.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `<h1>${post.name}</h1>
        <p class="category">${categoryName.toUpperCase()}</p>
        <p>${post.tagline}</p>`;
      const button = document.createElement("button");
      button.innerText = "Edit";
      button.addEventListener("click", e => {
        writeForm.querySelector("[name=title]").value = post.name;
        writeForm.querySelector("[name=tagline]").value = post.tagline;
        writeForm.querySelector("[name=category]").value = categoryName;
        writeForm.querySelector("[name=preview]").src = post.image;
        writeForm.querySelector("[name=content]").value = post.content;
        changePage("write");
      });
      div.appendChild(button);
      postsDiv.appendChild(div);
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
  if (cat == null) cat = []
  else cat = cat.val();

  var imgURL = preview.src;
  if (file.files[0]) {
    const ref = module.storage.ref(storage, `/posts/${category.value}-${Date.now()}`);
    await module.storage.uploadBytes(ref, file.files[0]);
    imgURL = await module.storage.getDownloadURL(ref);
  }

  var data = {
    name: title.value,
    tagline: tagline.value,
    image: imgURL,
    content: content.value
  }
  
  var replace = -1;
  cat.forEach((post, i) => {
    if (post.name == data.name) {
      replace = i;
      if (post.comments)
        data.comments = post.comments;
    }
  });
  if (replace < 0) replace = cat.length;

  await module.database.set(module.database.ref(database, `/posts/${category.value}/${replace}`), data);
  changePage("manage");
});