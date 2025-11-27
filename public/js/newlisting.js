
let houseInputs = document.querySelectorAll(".house-type-options-div input");
let privacyInputs = document.querySelectorAll(".privacy-type-options-div input");
let amenitiesInputs = document.querySelectorAll(".amenities-options-div input");

let spanTitles = document.querySelectorAll(".span-title");
let titles = document.querySelectorAll(".title");
let spanDescriptions = document.querySelectorAll(".span-description");
let descriptions = document.querySelectorAll(".description");

function giveBlackBorder(inputs) {
    inputs.forEach((input)=>{
        input.addEventListener("click",(e)=>{              
            inputs.forEach((input)=>{
                let label = e.target.labels[0];                
                if (input.labels[0].classList.contains("black-border")) {
                    input.labels[0].classList.remove("black-border")   
                } 
                label.classList.add("black-border");            
            })        
        })
    });
}

function checkListingCharLimit(Targetinput, Showspan) {
    Targetinput.forEach((input)=>{
        input.addEventListener("input",()=>{
            Showspan.forEach((span)=>{
                span.innerText = `${input.value.length}/${input.getAttribute("maxLength")}`;
            })
        })
    });
}

amenitiesInputs.forEach((input)=>{
    input.addEventListener("click",(e)=>{  
        let label = e.target.labels[0];             
        label.classList.toggle("black-border");      
    })
});

giveBlackBorder(houseInputs); 
giveBlackBorder(privacyInputs); 

checkListingCharLimit(titles, spanTitles);
checkListingCharLimit(descriptions, spanDescriptions);

function generateCurrencyOptions() {    
    
    // let allRates = JSON.parse('<%- JSON.stringify(allRates) %>');
    let allRates = ["INR","AUD", "BRL", "BGN", "CAD", "CLP", "CNY", "COP", "CRC", "CZK", "AED", "EUR", "EGP", "HKD", "HUF", "IDR", "JPY", "MXN", "MAD", "TWD","NZD", "NOK", "PEN", "PHP", "GBP", "QAR", "RON", "SAR", "SGD", "ZAR", "KRW", "SEK", "CHF", "THB", "TRY", "UGX", "UAH", "USD", "UYU", "VND"].sort();
    
    let currencySelect = document.querySelector("#currency");
    for (const key of allRates) {     
        let option = document.createElement("option");  
        option.value = key;
        option.innerHTML = key;
        currencySelect.appendChild(option);  
    }
}
generateCurrencyOptions();

function checkMinDaysVal(){
    let minDaysInput = document.querySelector("#minimum-days");
    let maxDaysInput = document.querySelector("#maximum-days");

    function makeDisable(){
        maxDaysInput.value = ""; 
        for (let i = 1; i <= maxDaysInput.childElementCount - minDaysInput.value; i++) {  
            maxDaysInput.children[i].disabled = false;
        }

        for (let i = 1; i <= minDaysInput.value; i++) {     
            maxDaysInput.children[i].disabled = true;
        } 
    }
  
    minDaysInput.addEventListener("change",()=>{  
        makeDisable();      
    });

    maxDaysInput.addEventListener("change",()=>{  
        if(maxDaysInput.value <= minDaysInput.value){
            makeDisable();
        }        
    });

}
// checkMinDaysVal()

function addGuests(){    

    let addGuests = document.querySelectorAll(".add-guest");

    // let maxTotalGuest = 25;
    // let guests = 1;
    // let guestsLimit =  maxTotalGuest;
    // let bedrooms = 0;
    // let bedroomsLimit = 50;
    // let bathrooms = 1;
    // let bathroomsLimit = 50;
    // let beds = 1;
    // let bedsLimit = 50;
    // let pets = 0;
    // let petsLimit = 5;

    let petInput = document.querySelector("#pets");
    let noOfPets = document.querySelector("#noOfPets");
    let petsPlusBtn = document.querySelector("#petPlusBtn");
    let totalPets = document.querySelector("#totalPetsBox");
    totalPets.style.display= "none";

    petInput.addEventListener("change",()=>{

        if(petInput.checked){
            totalPets.style.display= "flex";              
            pets = 1;
            noOfPets.value = pets;  
        } else{            
            totalPets.style.display= "none"; 
            pets = 0;
            noOfPets.value = pets;  
            if(pets<5){
                petsPlusBtn.classList.remove("fade-not-allowed");
            }         
        }        
    })


    function changeOpacity(plus, minus, sum, endLimit, startLimit) {
    if (sum<endLimit) {
       plus.classList.remove("fade-not-allowed");
    } else{
       plus.classList.add("fade-not-allowed");
    }
    if(sum==startLimit){
       minus.classList.add("fade-not-allowed");
    } else{
       minus.classList.remove("fade-not-allowed");
    }    
    }

    function plusFunc(sum, endLimit, displayGuestSpan) {
        if (sum<endLimit) {
            sum++;                       
            // displayGuestSpan.innerText = sum;   
            displayGuestSpan.value = sum;   
        }
        return sum;
    }
    function minusFunc(sum, startLimit, displayGuestSpan) {
        if (sum>startLimit) {
            sum--;                                  
            // displayGuestSpan.innerText = sum; 
            displayGuestSpan.value = sum;   
        }
        return sum;
    }

    addGuests.forEach((addGuest)=>{

             
        function initialFadeBtn(elemValue, initial){            
            if(elemValue==initial){
                addGuest.children[1].children[0].classList.add("fade-not-allowed");   
            }
        }

        initialFadeBtn(guests, 1);
        initialFadeBtn(infants, 0);
        initialFadeBtn(bedrooms, 0);
        initialFadeBtn(bathrooms, 1);
        initialFadeBtn(beds, 1);

        addGuest.addEventListener("click",(e)=>{                              
            
        if (addGuest.id == "guests") {            
            guests = logic(guests, guestsLimit, 1);            
        }else if (addGuest.id == "infants") {
            infants = logic(infants, infantsLimit);  
        }
        else if (addGuest.id == "bedrooms") {
            bedrooms = logic(bedrooms, bedroomsLimit);  
        }
        else if (addGuest.id == "beds") {
            beds = logic(beds, bedsLimit, 1);  
        } 
        else if (addGuest.id == "bathrooms") {
            bathrooms = logic(bathrooms, bathroomsLimit, 1); 

        } else if (addGuest.id == "add-pets"){            
            pets = logic(pets, petsLimit, 1);
        }
        else{}    


        function logic(sum, limit, startingLimit = 0) {
           
            let plusBtn = addGuest.querySelector(".add-guest-right .plus-guest"); 
            let minusBtn = addGuest.querySelector(".add-guest-right .minus-guest"); 
    
            if (e.target.className == "plus-guest") {  
            
                let displayGuestSpan = e.target.nextSibling.parentElement.children[1];        
                sum = plusFunc(sum, limit, displayGuestSpan);
                changeOpacity(plusBtn, minusBtn, sum, limit, startingLimit); 
                
            } else if (e.target.className == "minus-guest") {
    
                let displayGuestSpan = e.target.nextSibling.parentElement.children[1];
                sum = minusFunc(sum, startingLimit, displayGuestSpan)
                changeOpacity(plusBtn, minusBtn, sum, limit, startingLimit)
    
            } else{}
    
            return sum;              
        }

        })         
    })

}
addGuests(); 