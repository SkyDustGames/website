import { auth, database, storage, module } from "./firebase.js";
import params from "./query.js";

async function getPublicData(user) {
    let canLoad = true;
    const snapshot = await module.database.get(module.database.ref(database, "/users/" + user.uid)).catch(e => {
        canLoad = false;
        document.getElementById("username").innerText = "Private account";
        document.getElementById("pfp").src = "/anonymous.png";
    });

    if (!canLoad) return false;

    const data = snapshot.val();
    
    document.getElementById("username").innerText = data.name;
    document.getElementById("pfp").src = data.photoURL;

    return data;
}

async function initCurrentUser(user) {
    const data = await getPublicData(user);
    document.getElementById("displayName").value = data.name;
    document.querySelector(".profilePicture").src = data.photoURL;

    const form = document.getElementById("update");
    form.addEventListener("submit", async e => {
        e.preventDefault();

        if (e.submitter.value == "Sign Out") {
            module.auth.signOut(auth);
            return;
        } else if (e.submitter.value == "Switch Account Type") {
            const ref = module.database.ref(database, `/users/${user.uid}/public`);

            let publicAccount = (await module.database.get(ref)).val();
            if (!publicAccount) publicAccount = true;
            else publicAccount = false;

            await module.database.set(ref, publicAccount);

            return;
        }

        await module.database.set(module.database.ref(database, `/users/${user.uid}/name`),
        document.getElementById("displayName").value);

        const file = document.getElementById("profilePicture").files[0];
        if (file)
            await module.storage.uploadBytes(module.storage.ref(storage, `/users/${user.uid}/profile-picture`), file);

        window.location.reload();
    });

    document.getElementById("profilePicture").addEventListener("change", e => {
        const reader = new FileReader();
        reader.addEventListener("load", () => document.querySelector(".profilePicture").src = reader.result);

        const file = e.target.files[0];
        if (file) reader.readAsDataURL(file);
    });
}

async function init(data) {
    if (!data) return;
}

module.auth.onAuthStateChanged(auth, async user => {
    if (!user && !params.u) {
        window.location.replace("/auth/");
        return;
    }

    if (params.u && params.u !== user.uid) {
        document.getElementById("update").remove();
        init(await getPublicData({ uid: params.u }));
        return;
    }

    initCurrentUser(user);
});