import { auth, database, storage, module } from "./firebase.js";

const first = document.getElementById("first");
const signUp = document.getElementById("signUp");
const signIn = document.getElementById("signIn");

let email;
function trigger(mail, form) {
    email = mail;
    first.className = "";
    form.className = "visible";
}

function err(object, exception, focus, err2) {
    const error = document.querySelector(".err");
    if (exception)
        err2 = object.code.split("/")[1].toUpperCase().replaceAll("-", " ");

    object.className = "error";
    if (focus) object.focus();

    if (err2) {
        error.innerText = err2;
        error.className = "err visible";
    }
    
    setInterval(() => {
        object.className = "";
        if (err2) error.className = "err";
    }, 5000);
}

first.addEventListener("submit", e => {
    e.preventDefault();

    const emailInput = first.querySelector("[type=email]");
    if (!emailInput.value) {
        err(emailInput, false, true, "Type in an e-mail.");
        return;
    }

    module.auth.signInWithEmailAndPassword(auth, emailInput.value, "password").catch(error => {
        if (error.code == "auth/user-not-found") trigger(emailInput.value, signUp);
        else if (error.code == "auth/wrong-password") trigger(emailInput.value, signIn);
        else err(error, true, false);
    });
});

signUp.addEventListener("submit", e => {
    e.preventDefault();

    const passwordInput = signUp.querySelector("[type=password]");
    const confirmPasswordInput = signUp.querySelector("[type=password]");

    if (passwordInput.value == "password") {
        err(passwordInput, false, true, "Use a stronger password.");
        return;
    }

    if (passwordInput.value != confirmPasswordInput.value) {
        err(passwordInput, false, false, "Passwords don't match.");
        err(confirmPasswordInput, false, true, undefined);
        return;
    }

    module.auth.createUserWithEmailAndPassword(auth, email, passwordInput.value).then(async result => {
        const storageRef = module.storage.ref(storage, `/users/${result.user.uid}/profile-picture`);
        const blob = await fetch("/default_user.png").then(r => r.blob());
        await module.storage.uploadBytes(storageRef, blob);

        const ref = module.database.ref(database, `/users/${result.user.uid}`);
        await module.database.set(ref, {
            name: email.split("@")[0],
            photoURL: await module.storage.getDownloadURL(storageRef)
        });

        window.location.replace("/account");
    }).catch(e => {
        err(e, true, false);
    });
});

signIn.addEventListener("submit", e => {
    e.preventDefault();

    const passwordInput = signIn.querySelector("[type=password]");
    if (!passwordInput.value) {
        err(passwordInput, false, true, "Enter a password.");
        return;
    }

    module.auth.signInWithEmailAndPassword(auth, email, passwordInput.value).then(() => {
        window.location.replace("/account");
    }).catch(e => {
        err(e, true, false);
    });
});

module.auth.onAuthStateChanged(auth, user => {
    if (user)
        window.location.replace("/account");
});

document.getElementById("forgotPassword").addEventListener("click", e => {
    e.preventDefault();
    module.auth.sendPasswordResetEmail(auth, email).then(() => {
        err({ code: "auth/password-reset-email-sent" }, true, false)
    });
});