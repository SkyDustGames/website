let repos = sessionStorage.getItem("repos")? JSON.parse(sessionStorage.repos):
    await fetch("https://api.github.com/users/SkyDustGames/repos").then(r => r.json());
sessionStorage.setItem("repos", JSON.stringify(repos));

const projectName = window.location.href.split("/project/")[1];
let repository;
repos.forEach(repo => {
    if (repo.name == projectName)
        repository = repo;
});

if (!repository) window.location.replace("/projects/");

let contents = sessionStorage.getItem(`${projectName}-contents`)? JSON.parse(sessionStorage.getItem(`${projectName}-contents`)):
    await fetch(`https://api.github.com/repos/SkyDustGames/${projectName}/git/trees/main?recursive=true`).then(r => r.json());
sessionStorage.setItem(`${projectName}-contents`, JSON.stringify(contents));

let imgURL;
let readme = sessionStorage.getItem(`${projectName}-readme`);
if (!readme) {
    readme = await fetch(`https://api.github.com/repos/SkyDustGames/${projectName}/readme`).then(r => r.json());
    readme = (await fetch("/util/markdown", {
        method: "POST",
        headers: {"content-type":"application/json"},
        body: JSON.stringify([atob(readme.content)])
    }).then(r => r.json()))[0];

    sessionStorage.setItem(`${projectName}-readme`, readme);
}

contents.tree.forEach(async file => {
    if (file.path.endsWith("cover.png"))
        imgURL = `https://raw.githubusercontent.com/SkyDustGames/${projectName}/main/${file.path}`;
});

document.getElementById("cover").src = imgURL;
document.getElementById("readme").innerHTML = readme;
document.getElementById("readme").querySelector("h1").classList.add("title");

document.title = `SkyDust - ${projectName}`;