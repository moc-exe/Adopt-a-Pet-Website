/* Lev Ustinov, 40284421, SOEN287-S */

const express = require('express');
const path = require('path');
const port = 5240;
const app = express();
const bodyParser = require('body-parser');
const filesystem = require('fs');
const req = require('express/lib/request');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cookieParser = require('cookie-parser');
const { redirect } = require('express/lib/response');


// use different packages and modules

app.use(
	express.json(),
	express.urlencoded({
		extended: true,
  }));


app.use(express.static(path.join(__dirname, 'public/website')));


app.use(cookieParser());


app.get('/', function (req, res) {
    console.log(displayTime() + ": Got a request on '/'");
    res.sendFile(path.join(__dirname, 'public/website', "home.html"));
  })




/* Dealing with account creation on the website */

app.post('/account_check', (req, res) => {

    console.log(displayTime() + ": got a request on '/account_check' \n");

    let username = req.body.user;
    let password = req.body.password;

    
  filesystem.readFile("./public/website/data/login.txt", "utf8", (err, data) => {
        
        if(err){

            console.log(displayTime() + ": File login.txt couldnt be open/read: "  + err);
            return res.send("We are sorry, we are experiencing problems, please try again later :(");
        }

        let storedCredentials = getLineArrayFromFile(data, filesystem);

        if(usernameExists(username, storedCredentials)){

            console.log(displayTime() + " a user tried to create an account but the username " + username + " already exists\n");
            res.sendFile(path.join(__dirname, 'public/website', "create_account_error.html"));
            
        }
        
        
        else {
            
            let newCredentials = "\n" + username + ":" + password;


            filesystem.appendFile("./public/website/data/login.txt", newCredentials, function (err) {
                
                if(err){
                    console.log("File login.txt couldnt be written to : "  + err);
                    return res.send("We are sorry, we are experiencing problems, please try again later :(");
                }
              
            
            });
                
         console.log(displayTime() + ": user " + username + "just created an account\n");       
         res.sendFile(path.join(__dirname, 'public/website', "create_account_confirm.html"));
       
        }
    
    
    
    });

});



/* Logins from the menu here */

app.get('/loginSecondCheck', (req, res) => {

    if(req.cookies == undefined || req.cookies.loggedOn == undefined || req.cookies.loggedOn != "true"){

        res.sendFile(path.join(__dirname, 'public/website', "login2.html"));
    
    }

    else{
        
        res.redirect('/');
    }

})


app.post('/login_check2', (req, res) => {

    let username = req.body.user;
    let password = req.body.password;
    let loggedOnStatus = req.cookies.loggedOn;


    if(loggedOnStatus == true){

        res.sendFile(path.join(__dirname, 'public/website', "home.html"));
    }
    

    else{

        
    filesystem.readFile("./public/website/data/login.txt", "utf8", (err, data) => {



        if(err){
            console.log(displayTime() + ": File login.txt couldnt be open/read: "  + err);
            return res.send("We are sorry, we are experiencing problems, please try again later :(");
        }


        let storedCredentials = getLineArrayFromFile(data, filesystem);

        if(credentialsExists(username, password, storedCredentials)){
            
            console.log(displayTime() + ": user " + username + " just logged in\n");

            let cookieExpiry = toMilleseconds(0,30,0);
            res.cookie("loggedOn", true, {maxAge: cookieExpiry});
            res.cookie("username", username, {maxAge: cookieExpiry});
            res.sendFile(path.join(__dirname, 'public/website', "home.html"));


        }
        else{

            console.log(displayTime() + ": user failed to log in\n");
            res.sendFile(path.join(__dirname, 'public/website', "login_error2.html"));

        }

       })

    }
})





/* Logins from the HAVE A PET TO GIVEAWAY form here */

app.get('/loginCookieCheck', (req, res) => {

    console.log(displayTime() + " user tried to access the giveaway page\n");

    if(req.cookies == undefined || req.cookies.loggedOn == undefined){

        res.sendFile(path.join(__dirname, 'public/website', "login.html"));
        return;
    }

    let loggedOnStatus = req.cookies.loggedOn;


    if (loggedOnStatus == "true"){

        res.sendFile(path.join(__dirname, 'public/website', "giveaway.html"));
        
    }
    else{

        res.sendFile(path.join(__dirname, 'public/website', "login.html"));
    }

})

app.post('/login_check', (req, res) => {



    let username = req.body.user;
    let password = req.body.password;
    let loggedOnStatus = req.cookies.loggedOn;

    console.log(displayTime() + ": login request received\n");

    if(loggedOnStatus == true){

        res.sendFile(path.join(__dirname, 'public/website', "giveaway.html"));
    }
    

    else{

        
    filesystem.readFile("./public/website/data/login.txt", "utf8", (err, data) => {



        if(err){
            console.log(displayTime() + " File login.txt couldnt be open/read: "  + err + "\n");
            return res.send("We are sorry, we are experiencing problems, please try again later :(");
        }


        let storedCredentials = getLineArrayFromFile(data, filesystem);

        if(credentialsExists(username, password, storedCredentials)){
    
            console.log(displayTime() + ": user " + username + " just logged in\n");

            let cookieExpiry = toMilleseconds(0,30,0);
            res.cookie("loggedOn", true, {maxAge: cookieExpiry});
            res.cookie("username", username, {maxAge: cookieExpiry});
            res.sendFile(path.join(__dirname, 'public/website', "giveaway.html"));

        

        }
        else{

            console.log(displayTime() + ": user couldn't log in\n");
            res.sendFile(path.join(__dirname, 'public/website', "login_error.html"));

        }

       })

    }
})


/* Logout */
app.get('/logout', (req, res) => {



    if(req.cookies.loggedOn == undefined){

        res.redirect('/');
    
    }

    else{

        console.log(displayTime() + ": user " + req.cookies.username + " just logged out\n");

        res.clearCookie("loggedOn");
        res.clearCookie("username");
        res.sendFile(path.join(__dirname, 'public/website', "logout_confirm.html"));

    }
})



/* Giveaway form processing */

let petCounter = 27;
app.post('/processGiveaway', (req, res) => {

    
   


    // petCounter would be index = 0;
    let user = req.cookies.username; //1
    let animal = req.body.animal;    //2 
    let breed = req.body.breed;      //3
    let age = req.body.age;          //4
    let gender = req.body.gender;    //5
    let likesChildren = req.body.likesChildren;  //6
    let likesCats = req.body.likesCats;  //7
    let likesDogs = req.body.likesDogs;  //8
    let comments = req.body.comments; //9
    let owner = req.body.owner_name; //10
    let email = req.body.owner_email; //11
    ++petCounter;

    let newPetInfo = petCounter+":"+user+":"+animal+":"+breed+":"+age+":"+gender+":"+likesChildren+":"
                    +likesCats+":"+likesDogs+":"+comments + ":"+owner+":"+email+"\n";



    filesystem.appendFile("./public/website/data/petData.txt", newPetInfo, function (err) {
                
        if(err){
            console.log("File petData.txt couldnt be written to : "  + err);
            return res.send("We are sorry, we are experiencing problems, please try again later :(");
        }
        else{

            console.log(displayTime() + ": new pet added to database\n")

        }

    });


    res.redirect('/');
})



/* Processing the findPet form here*/
app.post('/findPet', (req, res) => {

    console.log(displayTime() + ": new FIND PET request\n");


    // petCounter would be index = 0;
    let req_animal = String(req.body.animal);    //2 required
    let req_breed = String(req.body.breed);      //3 required
    let req_age = String(req.body.age);           //4 required           
    let req_gender = String(req.body.gender);    //5 required
    let req_likesChildren = String(req.body.likesChildren);  //6
    let req_likesCats = String(req.body.likesCats);  //7
    let req_likesDogs = String(req.body.likesDogs);  //8
    
    

    filesystem.readFile("./public/website/data/petData.txt", "utf8", (err, data) => {

    
        let matchedPetsArray = new Array();
        
        if(err){
            console.log("File petData.txt couldnt be open/read: "  + err + "\n");
            return res.send("We are sorry, we are experiencing problems, please try again later :(");
        }

        let storedPetData = getLineArrayFromFile(data, filesystem);
        letOutIndex = 1;
        
        for(let i = 0; i < storedPetData.length; i++){

            

            let processedPet = getArrayFieldsFromLine(storedPetData[i]);
            let outputPet = "";
            let petIndex = processedPet[0];
            let user = processedPet[1];
            let animal = processedPet[2];   //2 
            let breed = processedPet[3];      //3
            let age = processedPet[4];         //4
            let gender = processedPet[5];    //5
            let likesChildren = processedPet[6];  //6
            let likesCats = processedPet[7];  //7
            let likesDogs = processedPet[8];  //8
            let comments = processedPet[9]; //9
            let owner = processedPet[10]; //10
            let email = processedPet[11]; //11


                // a few utility functions again
                function compareChildren(){

                    if(req_likesChildren == 'undefined'){
                        return true;
                    }
                    return req_likesChildren == likesChildren;
                }

                function compareCats(){
                    if(req_likesCats == 'undefined'){
                        return true;
                    }
                    return req_likesCats == likesCats;
                }

                function compareDogs(){
                    if(req_likesDogs == 'undefined'){
                        return true;
                    }
                    return req_likesDogs == likesDogs;
                }
                
                function compareBreeds(){
                    if(req_breed == 'does not matter'){
                        return true;
                    }
                    return req_breed == breed;

                }

                function compareGender(){
                    if(req_gender == 'nomatter'){
                        return true;
                    }
                    return req_gender == gender;

                }



            if( 
                req_animal == animal &&
                compareBreeds()  &&
                (parseInt(req_age) >= parseInt(age)) && 
                compareGender() &&
                compareChildren() && 
                compareCats() && 
                compareDogs() 
            ){

                let matchedPet = 

                    "<b>Pet No: " + petIndex + "</b>" + "<br>"+
                    "<b>Type of animal: </b> " + animal + "<br>" +
                    "<b>Breed: </b> " + breed + "<br>"+
                    "<b>Age: </b>" + age + " years old " + "<br>"+
                    "<b>Gender: </b>"+ gender + "<br>"+
                    "<b>Comments: </b> " + comments + "<br>"+
                    "<b>Owner's name: </b>" + owner + "<br>"+
                    "<b>Owner's email: </b> " + email + "<br><br>";
                
                matchedPetsArray.push(matchedPet);

            }
        }

    
        let resString = "";
        if(matchedPetsArray.length == 0){
            resString = "Currently, <span style = 'color: darkred;'>no pets to match your criteria</span>, we are sorry D: <br>Try checking your spelling or modify criteria or wait until new listings appear!";
        }else{
            resString += "<span style = 'color: darkred;'>Here are the pets that match your criteria:</span><br><br>";
            for(let arrayIndex = 0; arrayIndex < matchedPetsArray.length; arrayIndex++){
                resString += matchedPetsArray[arrayIndex];
            }
        }
    
    
        let documentString= `
        
        
        <!DOCTYPE html>
        <html lang ="en">
        <head>
        <meta charset="UTF-8">
        <link rel = "stylesheet" href = "./CSS/create_account.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Protest+Riot&display=swap" rel="stylesheet">
       
        
        <title>Adopt a Dog/Cat: Home</title>
    
    
        </head>
    
    
        <body>
        <span id = "time"></span>
        <span id = "loginInfo"></span>
        <a href = "./home.html"><header><p>Adopt a Cat or a Dog</p></header></a>
        
        <div id = "main">
            
            <div id = "menu">
                <ul>
        
                    <li><h1>Menu</h1></li>
                    <li><a href = "./home.html"><h3>Home</h3></a></li>
                    <li><a href = "./create_account.html"><h3>Create Account</h3></a></li>
                    <li><a href = "./find_dog_cat.html"><h3>Find a dog / cat</h3></a></li>
                    <li><a href = "./dog_care.html"><h3>Dog Care</h3></a></li>
                    <li><a href = "./cat_care.html"><h3>Cat Care</h3></a></li>
                    <li><a href = "./loginCookieCheck"><h3>Have a Pet to give away?</h3></a></li>
                    <li><a href = "./contact.html"><h3>Contact</h3></a></li>
                    <li><a href = "./loginSecondCheck"><h3>Login</h3></a></li>
                    <li><a href = "./logout"><h3>Logout</h3></a></li>
        
                </ul>
            </div>
            <div id = "form_div">
                
                ${resString}
    
            </div>
    
        </div>
        
        <footer>
            <span id = "disclaimer">
                Privacy disclaimer: We take your privacy seriously. 
                 Any personal information you provide to us, such as your name, email address, or contact details, 
                 will be treated with the utmost confidentiality and will only be used for the purposes outlined in our Privacy Policy.
            </span>
            
        </footer>
    
        <script src = "./JS/script.js"></script>
    
        </body>
    
        </html> 
        `;
    
        res.send(documentString);

    })
})


/* starting the app */
app.listen(port, () => {
    let date = new Date();
    console.log(`Adopt a pet server listening on port: ${port} on ${date} \n`);

});




/* utility methods here :sigh */
function getLineArrayFromFile(data){

    if(data.length == 0){
        return [];
    }

    return data.split("\n");
}

function getArrayFieldsFromLine(line){

    if(line.length == 0){
        return [];
    }

    return line.trim().split(":");
}

function usernameExists(username, loginArray){

    for (let i in loginArray) {
        

        let currentUsername = loginArray[i].split(":")[0];
        
        if(username == currentUsername){
            return true;
        }

    }
    return false;
}


function credentialsExists(username, password, loginArray){

    let enteredCredentials = username + ":" + password;

    for (let i in loginArray) {

        let credentialsStoredAtIndex = loginArray[i].trim();
        if(enteredCredentials == credentialsStoredAtIndex){

            return true;

        }

    }

    return false;
}

function toMilleseconds(hours, minutes, seconds){

    return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000);

}

function isEmpty(element){

    if (element.length == 0){
        return true;
    }

    return false;
}

function displayTime(){

    let date = new Date();
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); //correcting because array;
    let year = date.getFullYear();
    let hour = date.getHours().toString().padStart(2, "0");
    let min = date.getMinutes().toString().padStart(2, "0");
    let seconds = date.getSeconds().toString().padStart(2, "0");
    let fullDate = "Current time: " + day + "/" + month + "/" + year  + "  " + hour + ":" + min + ":" + seconds;
    return fullDate;
}