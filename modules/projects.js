let repos = sessionStorage.getItem("repos")? JSON.parse(sessionStorage.repos):
    await fetch("https://api.github.com/users/SkyDustGames/repos").then(r => r.json());
sessionStorage.setItem("repos", JSON.stringify(repos));

const topic = window.location.href.split("/projects/")[1];
if (topic) {
    repos = repos.filter(repo => repo.topics.includes(topic));
    document.title = `SkyDust - Projects tagged ${topic}`;
}

const projects = document.getElementById("projects");
repos.forEach(repo => {
    projects.innerHTML += `<a href="/project/${repo.name}">
    <div class="project">
        <h1>${repo.name}</h1>
        <p>${repo.description}</p>
        <div class="topics">
            <a class="topic" href="/projects/">all</a>
        ${repo.topics.map(topic => `
            <a class="topic" href="/projects/${topic}">${topic}</a>
        `).toString().replaceAll(",", "")}
        </div>
    </div>
</a>`
});

if (repos.length == 0) projects.innerHTML = `<p>No repos ${topic? `tagged ${topic} `: ""}found :&lpar;`;