/*Lev Ustinov, SOEN287-S, 40284421, Assignment2*/


// displays current time and gets called every 1000 milliseconds = 1s to update
function displayTime(){

    let date = new Date();
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); //correcting because array;
    let year = date.getFullYear();
    let hour = date.getHours().toString().padStart(2, "0");
    let min = date.getMinutes().toString().padStart(2, "0");
    let seconds = date.getSeconds().toString().padStart(2, "0");
    let fullDate = "Current time: " + day + "/" + month + "/" + year  + "  " + hour + ":" + min + ":" + seconds;
    document.getElementById('time').innerHTML = fullDate;

}
setInterval(displayTime, 1000);


/* Shows current login status of the user on the page, get refreshed every second */

    function showLoginStatus(){

        if(isLoggedOn()){

            document.getElementById("loginInfo").innerHTML = `Welcome, ${getCookie("username")}! You are currently logged on.`
            document.getElementById("loginInfo").style.color = "green";
            document.getElementById("loginInfo").style.fontFamily = "Protest Riot, Geneva, Tahoma, sans-serif";
        
        }
        else{
            
            document.getElementById("loginInfo").innerHTML = "Welcome, guest! You are currently logged off."
            document.getElementById("loginInfo").style.color = "red";
            document.getElementById("loginInfo").style.fontFamily = "Protest Riot, Geneva, Tahoma, sans-serif";

        }

    }
    setInterval(showLoginStatus, 1000);




    //checks if a string is empty
    function isEmpty(prompt){
        return prompt == "";
    }

    //checks if the email string follows the right format
    function validEmail(prompt){
        if (prompt.match(/^[^,\b]+@{1}([A-Za-z])+(\.[A-z]{2,4})$/) == null){
            return false;
        }
        
        return true;
    }

    // checks if the username is a valid entry 
    function validUsername(prompt){
        return !(prompt.match(/\w+/g) == null);
    }

    // checks if the password is a valid entry
    function validPassword(prompt){
        
        if (prompt.length < 4){
            return false;
        }
        if(prompt.match(/\d+/g) == null){
            return false;
        }
        if(prompt.match(/[A-Za-z]+/g) == null){
            return false;
        }
        return true;
    }

    

    
    // validates input on find_dog_cat.html
    function validateInputFindPet(){
    
        let cat_or_dog = document.querySelector( 'input[name="animal"]:checked');
        let breed = document.getElementById("breed").value;
        let age =  document.getElementById("age").value;
        
        if(isEmpty(breed) || isEmpty(age) || (cat_or_dog == null)){
            alert("missing fields! please fill them before submitting the form!");
            return false;
        }
        alert("Form submitted successfully !");
        return true;

    }

    // validates input on giveaway.html
    function validateGiveaway(){

        let cat_or_dog = document.querySelector( 'input[name="animal"]:checked');
        let breed = document.getElementById("breed").value;
        let age =  document.getElementById("age").value;
        let name = document.getElementById("owner_name").value;
        let email = document.getElementById("owner_email").value;

    
        if(isEmpty(breed) || isEmpty(age) || (cat_or_dog == null) || isEmpty(email) || isEmpty(name)){
            alert("missing fields! please fill them before submitting the form!");
            return false;
        }
        if(!validEmail(email)){
            alert("wrong email format, please check again before submitting!");
            return false;
        }
        alert("Form submitted successfully! Thank you, we'll get in touch with you soon!");
        return true;
    }

    function validateLogin(){

        let username = document.getElementById("user").value;
        let password = document.getElementById("password").value;

        if(isEmpty(username) || isEmpty(password)){
            alert("missing fields! please fill them before submitting the form!");
            return false;
        }

        if(!validUsername(username)){
            alert("username is invalid, please follow the requirements.");
            return false;
        }
        if(!validPassword(password)){
            alert("password is invalid, please follow the requirements");
            return false;
        }

        return true;

    }

    function isLoggedOn(){

        let cookieList = document.cookie;


        if(cookieList.includes("loggedOn=true")){
            return true;
        }
        else{
            return false;
        }


    }

    function getCookie(cookieName){

        let name = cookieName + "=";
        
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookieArray = decodedCookie.split(';');
        
        
        for (let cookieIndex = 0; cookieIndex < cookieArray.length; cookieIndex++){

                let cookie = cookieArray[cookieIndex].trim();
            
                    if (cookie.indexOf(name) === 0) {
                        return cookie.substring(name.length);
                    }
        }
    
        return "";
    }