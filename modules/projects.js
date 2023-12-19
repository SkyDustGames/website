let repos = sessionStorage.getItem("repos")? JSON.parse(sessionStorage.repos):
  await fetch("https://api.github.com/users/SkyDustGames/repos").then(r => r.json());
sessionStorage.setItem("repos", JSON.stringify(repos));

const topic = window.location.href.split("/projects/")[1];
if (topic) {
  repos = repos.filter(repo => repo.topics.includes(topic));
  document.title = `SkyDust - Projects tagged ${topic}`;
}

const projects = document.getElementById("projects");
repos.forEach(async repo => {
  let contents = sessionStorage.getItem(`${repo.name}-contents`)?
    JSON.parse(sessionStorage.getItem(`${repo.name}-contents`)):
    await fetch(`https://api.github.com/repos/SkyDustGames/${repo.name}/git/trees/main?recursive=true`)
      .then(r => r.json());

  let imgURL;
  contents.tree.forEach(async file => {
    if (file.path.substring(file.path.lastIndexOf("/")) === "/cover.png")
      imgURL = `https://raw.githubusercontent.com/SkyDustGames/${repo.name}/main/${file.path}`;
  });
  if (!imgURL) imgURL = "/default_cover.png";

  sessionStorage.setItem(`${repo.name}-contents`, JSON.stringify(contents));

  const div = document.createElement("div");
  div.className = "project";

  div.innerHTML = `<img class="cover" src="${imgURL}">
  <h1>${repo.name}</h1>
  <p>${repo.description}</p>
  <div class="topics">
    <a class="topic" href="/projects/">all</a>
  ${repo.topics.map(topic => `
    <a class="topic" href="/projects/${topic}">${topic}</a>
  `).toString().replaceAll(",", "")}
  </div>`

  div.addEventListener("click", e => {
    if (e.target !== div) return;
    window.location.href = "/project/" + repo.name;
  });

  projects.append(div);
});

if (repos.length == 0) projects.innerHTML = `<p>No repos ${topic? `tagged ${topic} `: ""}found :&lpar;`;