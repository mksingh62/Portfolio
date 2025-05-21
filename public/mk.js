const forms = document.querySelector(".forms"),
pwShowHide = document.querySelectorAll(".eye-icon"),
links = document.querySelectorAll(".link");
const passs = document.querySelectorAll(".pass")
const btn =document.querySelectorAll(".btn-login")
// const onSignIn = document.querySelectorAll(".g-signin2")






function showModel(){
  document.querySelector(".form").classList.add('showform');
  document.querySelector(".container").classList.add('showcontainer');
}
var btnlogin =document.querySelector(".btn-login");
btnlogin.addEventListener("click", showModel)

function closeModel(){
  document.querySelector(".form").classList.remove('showform');
  document.querySelector(".container").classList.remove('showcontainer');
}
var cancel =document.querySelector(".cancel");
cancel.addEventListener("click", closeModel)

pwShowHide.forEach(eyeIcon => {
eyeIcon.addEventListener("click", () => {
  let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");
  
  pwFields.forEach(password => {
      if(password.type === "password"){
          password.type = "text";
          eyeIcon.classList.replace("bx-hide", "bx-show");
          return;
      }
      password.type = "password";
      eyeIcon.classList.replace("bx-show", "bx-hide");
  })
  
})
})      

links.forEach(link => {
link.addEventListener("click", e => {
 e.preventDefault(); //preventing form submit
 forms.classList.toggle("show-signup");
})
})
passs.forEach(pass => {
  pass.addEventListener("click", e => {
   e.preventDefault(); //preventing form submit
   forms.classList.toggle("show-reset");
  })
  })
  
 
    

