  
if (currUser) {
// let userObj = JSON.parse(currUser);

let navProfile = document.querySelector("nav #nav-login-div #nav-profile");

navProfile.innerHTML = currUser.profileImg ? `<img src="${currUser.profileImg}" alt="user-profile">` : currUser.username.trim().slice(0,1).toUpperCase();
navProfile.style.backgroundColor = currUser.profileImg ? "transparent" : "#232323";
}
