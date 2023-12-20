import { auth, database, storage, module } from "./firebase.js";
import params from "./query.js";

async function getPublicData(user) {
  let canLoad = true;
  const username = document.getElementById("username");
  const profilePicture = document.getElementById("pfp");
  const snapshot = await module.database.get(module.database.ref(database, "/users/" + user.uid)).catch(e => {
    canLoad = false;
    username.innerText = "Private account";
    profilePicture.src = "/anonymous.png";
  });

  if (!canLoad) return false;

  const data = snapshot.val();
  
  if (data.banned) {
    username.innerText = `Banned: ${data.banned}`;
    profilePicture.src = "/ban.png";
  } else {
    username.innerText = data.name;
    profilePicture.src = data.photoURL;
  }

  return data;
}

async function setupAppealForm() {
  const form = document.getElementById("appeal");
  form.className = "";

  const textArea = form.querySelector("textarea");
  textArea.disabled = (await module.database.get(module.database.ref(database, `/users/${auth.currentUser.uid}/appeal`))).val();

  if (textArea.disabled) {
    form.querySelector("[value=\"Submit Appeal\"]").value = "Your appeal was sent for review.";
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (e.submitter.value === "Sign Out")
      module.auth.signOut(auth);
    else if (e.submitter.value == "Delete Account") {
      await module.database.set(module.database.ref(database, `/users/${auth.currentUser.uid}`), null);
      module.auth.deleteUser(auth.currentUser);
    } else {
      await module.database.set(module.database.ref(database, `/users/${auth.currentUser.uid}/appeal`), textArea.value);
      textArea.disabled = true;
      form.querySelector("[value=\"Submit Appeal\"]").value = "Your appeal was sent for review.";
    }
  });
}

async function initCurrentUser(user) {
  const data = await getPublicData(user);
  document.getElementById("displayName").value = data.name;
  document.querySelector(".profilePicture").src = data.photoURL;

  const form = document.getElementById("update");
  if (data.banned) {
    form.remove();
    setupAppealForm();
    return;
  }

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

  if (user.uid === "txYWRmn5NkfTRP7y6rhihrEtgVu2") { // Admin UID
    const admin = document.createElement("a");
    admin.innerText = "Admin Page";
    admin.href = "/admin";
    form.append(admin);
  }
}

async function init(data) {
  if (!data) return;
  // TODO: Load user's comments
}

module.auth.onAuthStateChanged(auth, async user => {
  if (!user && !params.u) {
    window.location.replace("/auth");
    return;
  }

  if (params.u && params.u !== user.uid) {
    document.getElementById("update").remove();
    init(await getPublicData({ uid: params.u }));
    return;
  }

  initCurrentUser(user);
});