  
if (currUser != "") {
let userObj = JSON.parse(currUser);

let navProfile = document.querySelector("nav #nav-login-div #nav-profile");

navProfile.innerHTML = userObj.profileImg ? `<img src="${userObj.profileImg}" alt="user-profile">` : userObj.username.trim().slice(0,1).toUpperCase();
navProfile.style.backgroundColor = userObj.profileImg ? "transparent" : "#232323";
}
