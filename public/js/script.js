function bootstrapFormValidation(){
  (() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()
}
bootstrapFormValidation();


let menu = document.querySelector("nav #nav-div #nav-linksandlogin #nav-login-div");
let loginDiv = document.querySelector("nav #nav-login-div #login-opt-div");

menu.addEventListener("click", ()=>{
  loginDiv.classList.toggle("loginDiv");
});

document.querySelector(".container-div").addEventListener("click",()=>{
  loginDiv.classList.remove("loginDiv");
})



function submitBtnAnimation() {
  document.querySelectorAll('.animation-submit').forEach((form)=>{
    if(form){    
        form.addEventListener('submit', function (e) {
            const inputs = form.querySelectorAll('input');
            const selects = form.querySelectorAll('select');
            const button = form?.querySelector('.submitBtn');
            const spinner = button?.querySelector('.spinner');
            const buttonText = button?.querySelector('.submitBtn-text');
  
            let hasEmpty = false;
            inputs.forEach(input => {
              if (input.value.trim() === '') {
                hasEmpty = true;
              }
            });
  
            selects.forEach(select => {
              if (select.value.trim() === '') {
                hasEmpty = true;
              }
            });
  
            if (hasEmpty) {
              e.preventDefault();  
              return;  
            }
  
            // Disable button and show spinner immediately on submit
            if(button) button.disabled = true;
            if(buttonText) buttonText.style.display = 'none';
            if(spinner) spinner.style.display = 'inline-flex';
            // No preventDefault — normal form submission will proceed
        });
    }
  });
}
submitBtnAnimation();


function showCurrencyGlobe() {
  const globes = document.querySelectorAll(".globe");
  const currencyContainer = document.querySelector(".currency-container");
  const closeBtn = document.querySelector(".currency-container .cross");

  if (!currencyContainer || !closeBtn || globes.length === 0) return;

  // Show container when globe is clicked
  globes.forEach(globe => {
    globe.addEventListener("click", (e) => {
      e.stopPropagation(); // Don't bubble to document
      currencyContainer.classList.remove("hide");
    });
  });

  // Hide when cross is clicked
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currencyContainer.classList.add("hide");
  });

  // Hide when clicking outside the container
  document.addEventListener("click", (e) => {
    if (!currencyContainer.classList.contains("hide") && !currencyContainer.contains(e.target)) {
      currencyContainer.classList.add("hide");
    }
  });

  // Hide on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      currencyContainer.classList.add("hide");
    }
  });
}showCurrencyGlobe() 
