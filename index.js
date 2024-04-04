import {Data} from "./data.js"
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { signInAnonymously, getAuth, signInWithRedirect, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, sendEmailVerification as _sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential, updatePassword, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import { getFunctions, httpsCallable  } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js'

import { GridIcon } from "./components.js"

const firebaseConfig = {
    apiKey: "AIzaSyAoZwZNIX-K0HH9qOyVgrHCH5bHWfkRtBw",
    authDomain: "frenchfripefirebase-b10da.firebaseapp.com",
    projectId: "frenchfripefirebase-b10da",
    storageBucket: "frenchfripefirebase-b10da.appspot.com",
    messagingSenderId: "771961415159",
    appId: "1:771961415159:web:30d6912b7dd3d87f0a3af2",
    measurementId: "G-E8BF70J5WS"
  };


let App = null;
let Auth = null;
let Functions = null;
let User = null;

const Categories = document.getElementById("categories");
const main = document.body;



/*  Initialize firebase, initializes the firebase app with the given configuration
    after initializing wait for an auth state change and return */
App = initializeApp(firebaseConfig);
Functions = getFunctions(App, "asia-southeast1");

Auth = getAuth();
signInAnonymously(Auth)
onAuthStateChanged(Auth, async (userData) => {
    User = userData;
    if (User != null) {
        console.log("user has been signed", userData);
    } else {
        signInAnonymously(Auth)
    }
});

const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
window.addEventListener("touchstart", (e) => {
    for (let video of document.querySelectorAll("video")) {
       if ( !isVideoPlaying(video)) video.play();
    }
})

export function showMenu(){
    main.toggleAttribute("menu", true)
}
export function hideMenu(){
    main.toggleAttribute("menu", false)
}


function render(data = Data){
    for (let category of data) {
        let element = document.querySelector(`photo-grid[category = "${category.name.toLowerCase()}"]`);
        if (element != null) {
            console.log(element);
            element.value = category;
        }
    }
}

function textAreaAutoResize(){
    let textareas = document.querySelectorAll("textarea");
    for (let textarea of textareas) {
        let minRows = parseInt(textarea.getAttribute("min-rows"));
        minRows = Number.isNaN(minRows) ? 5 : minRows;
        textarea.addEventListener("input", () => {
            let lines = textarea.value.split("\n").length
            textarea.setAttribute("rows", lines > minRows ? lines : minRows)
        })
    }
}

const defaultPage = "home";
let currentPage = "home"

function getURLPage(){
    let hash = window.location.hash.replace("#", "");
    if (hash.length == 0) hash = "home";
    return hash;
}
function setURLPage(name) {
    window.location = window.location.origin + (name == null ? "/#" : '/#' + name);
}

function setPage(name) {
    if (currentPage != name) {
        currentPage = name;
        let pages = document.querySelectorAll("#pages > div");
        for (let page of pages) {
            page.toggleAttribute("selected", page.getAttribute("name") == name);
        }
    }
}

export function selectPage(name) {
    setURLPage(name)
    setPage(name);
    hideMenu();
}

export function showPopup(message) {
    let popup = document.querySelector("popup-info");
    popup.children[0].innerHTML = message;
    popup.toggleAttribute("show", true);
}

export function hidePopup(){
    let popup = document.querySelector("popup-info");
    popup.toggleAttribute("show", false);
}


const validator = {
    email: (string) => string.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    number: (string) => string.match(/^[\d\s]+$/),
    message: (string) => string.length > 4,
    name: (string) => string.length > 1
}
const errorMessage = {
    name: "Your name must be longer than 2 characters.",
    number: "Your number must contain only numbers and spaces.",
    email: "Your email address is invalid",
    message: "Your message is to short, please write some more."
}
async function sendMessage(){
    const sendEmail = httpsCallable(Functions, 'sendContactEmail');
    let inputs = document.querySelectorAll("[name = 'contact'] .form input, [name = 'contact'] .form textarea");
    let data = {}
    let valid = true;
    for (let input of inputs) {
        let value = input.value;
        let name = input.getAttribute("name");
        let isValid = validator[name](value);
        if (!isValid) {
            showPopup(errorMessage[name]);
            valid = false;
            break;
        }
        data[name] = input.value;
    }
    if (valid) {
        for (let input of inputs) input.value = ""
        console.log("sending message :", data);
        showPopup("Your message has been sent.")
        let {success} = await sendEmail(data);
        console.log("message was sent with response ", success);
    }
    
}


setPage(getURLPage())
window.addEventListener("hashchange", (e) => {
    setPage(getURLPage())
})



textAreaAutoResize();
render();
console.log("here");
window.selectPage = selectPage;
window.hideMenu = hideMenu;
window.showMenu = showMenu;
window.hidePopup = hidePopup;
window.showPopup = showPopup;
window.sendMessage = sendMessage;