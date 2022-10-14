//Some variables to keep the express and socket.io functioning properly.
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const moment = require('moment'); //Moment.js to help calculate time.
//Above are variables to keep express and socket.io functioning properly.

//Message history to keep track of the messages in the chat.
const msg_history = [];

//Current users that are currently in the chat, this will be an array of user objects.
const currentUsers = [];

//User count mainly used to keep track of how many users have joined the session. Mainly used to give non-gibberish usernames.
let user_count = 1;

//Function that makes a message object, and stores the message in history when needed.
//Username: The user's name
//msg: The message the user has input
//colorHex: The hexadecimal code for the user's desired color.
//Store: Boolean that determines whether this message should be stored in history.
function makeMessage (username, msg, colorHex, store) {
    let time = moment().format('hh:mm A');  //Calculate time
    let msg_obj = {username, msg, colorHex, time}   //Create message object
    
    //If the message should be stored in memory, then we should push the object onto the array.
    if (store == true) {
        msg_history.push(msg_obj);
    }
    return msg_obj; //Make sure to return the message object.
}

//Function that adds a user to the currentUsers array, which keeps track of users in the chatroom.
//Id: The user's id
//Username: The user's username
//Color: The user's color in hexadecimal.
function addUser(id, username, color) {
    const new_user = { id, username, color};    //New user object

    currentUsers.push(new_user);    //Push the new user object onto the array
    return new_user;    //Return the user object
}

//Function to remove a user from the currentUsers array.
//Id: Id of the user to be removed.
function removeUser(id) {  
    let temp;   //Temp variable to keep track of the index at which we need to remove the user.
        for (let i in currentUsers) {   //Loop through the currentusers, and find the id that matches the id being passed in.
            if (currentUsers[i].id == id) {
                temp = i;   //Set temp variable to i.
                break;  //Break out of the loop once we find the object
            }
        }
        currentUsers.splice(temp,1); //Remove the user at that index.
    }


//Function to return a certain user.
//Id: The user's id
function getUser(id) {
    for (let x in currentUsers) {   //Loop through the currentUser array 
        if (currentUsers[x].id == id) { //Once we find the id, we can return that user.
            return currentUsers[x];
        }
    }
}

//Function to get the hex code for a color when a user joins initially.
//color: The color that the user had chosen on the join screen.
function getColor(color) {
    if (color == "Red") {
        return "#f2250f";
    } else if (color == "Blue") {
        return "#2992e3";
    } else if (color == "Green") {
        return "#49c904";
    } else if (color == "Orange") {
        return "#ffa305";
    } else if (color == "Purple") {
        return "#971cfc";
    } else if (color == "Pink") {
        return "#f200ff";
    } else if (color == "Black") {
        return "#000000";
    } else if (color == "default" || color == "undefined") {
        return "#e4e5e9";
    }
}

//Function to create a random username for users that have their username taken or did not give a username.
//count: An int to be added to a string "USER#" to distinguish between users.
function randomUsername(count) {
    to_str = count.toString();  //Change int to a string
    return "USER#" + to_str;    //Return the new username.
}

app.use(express.static(path.join(__dirname, 'public'))); //Include the public folder in the project

//When a socket initiates a connection to the server:
io.on('connection', socket => {
    //console.log('New connection!');
    
    //Handle when a socket returns a joinChat response.
    //Usern: The username the user input
    //color: The color that the user had chosen.
    socket.on('joinChat', ({usern, color }) => {

        // To restore chat history for the connecting user.
        // Just loop through the msg_history array and repost the messages before they join.
        for (let i in msg_history) {
            socket.emit('message', msg_history[i]);
        }

        let colorHex = getColor(color);     //Grab the color hex based on the value of 'color'
        let new_username = usern.trim();    //Trim the username of any odd whitespace.
        
        //Check if the username is already taken, or if it is empty. If any is true, then we give a random username.
        if (new_username == "") { // If the username is blank then 
            new_username = randomUsername(user_count);  //We will give them a random one.
        } else if (new_username.length > 16) {  //If the username is too long
            new_username = randomUsername(user_count);  //We will give them a random one.
            socket.emit('message', makeMessage('Server', "IMPORTANT: Desired username is too long. You have been assigned the username " + new_username + ". Please change your username with the /changename command."), "server");
        } else {    //Else we will check to see if the username is already taken.
            for (let i in currentUsers) {   //Loop through usernames
                if (currentUsers[i].username == new_username) { //If we find an existing username
                    new_username = randomUsername(user_count);  //We also assign them a random one.
                    //We will also prompt them via server message with instructions on how to change their username.
                    socket.emit('message', makeMessage('Server', "IMPORTANT: Desired username already taken. Your username was changed to " + new_username + " . Use the /changename command to change your username.", undefined,false), "server");
                }
            }
        }
        
        //Create new user after finalizing name and color.
        const user = addUser(socket.id, new_username, colorHex);
        
        //Prompt the user with a little welcome message from the server.
        socket.emit('message', makeMessage('Server', "Welcome to the chatroom, " + user.username + ".", undefined,false), "server");

        //Notify the other users that this user has joined the room.
        socket.broadcast.emit('message', makeMessage('Server', user.username + ' has joined the chatroom.', undefined,true), "server");
        
        //Remake the list of connected users for every user.   
        io.emit('manageUsers', currentUsers);
        
        //Increase the user_count by one.
        user_count = user_count + 1;
        // console.log(currentUsers);
    });

    //Socket on disconnect response.
    socket.on('disconnect', () => {
        const user = getUser(socket.id);    //Find that user
        removeUser(user.id);    //Remove that user from the currentUsers list.
        // console.log(currentUsers);  
        //Notify all users that the corresponding user has left the room.
        io.emit('message', makeMessage('Server', user.username + " has left the chatroom. :(",undefined,true), "server");
        //Remake the list for all the users.
        io.emit('manageUsers', currentUsers);
    });

    //Server chatmessage event when user sends chat message.
    socket.on('chatmessage', msg => {

        trim_msg = msg.trim();  //Trim message of any weird whitespace.
        if (trim_msg === "") {  //If the message is empty, then simply don't send the message.
            //Do nothing
            // console.log("Nothing.");
        } else {    //Else send the message
            const user = getUser(socket.id);    //Get the user sending the message
            msg_data = makeMessage(user.username, msg, user.color, true);   //Create the message as an object.
            // console.log("Message Data:" + msg_data.colorHex);
            socket.broadcast.emit('message', msg_data);     //Emit to other users the message by the user
            socket.emit('message', msg_data, "single");     //Also emit it to the sender, but a different parameter to help distinguish their messages.
        }
    });

    //Function to handle changing username event.
    socket.on('changeusername', new_name => {
        let change = true;  //Initialize boolean
        let old;    //Variable to keep track of old name for notification purposes.
        // console.log(currentUsers);
        if (new_name.length > 16) { //Personal restriction on length of the username.
            //Prompt the user via server message that their username is too long.
            socket.emit('message', makeMessage('Server', "Desired username is too long!"), "server");
        } else {    //Else we loop through the array to see if the username already exists.
            for (let i in currentUsers) {
                if (currentUsers[i].username == new_name) { //If we find an existing username
                    //console.log(currentUsers);
                    //Prompt the user that their username is already taken.
                    socket.emit('message', makeMessage('Server', "Username already taken!"), "server");
                    change = false; //Set change username to false.
                }
            }

            //Only change the username if the change boolean is true.
            if (change == true) {
                for (let i in currentUsers) {   //Loop through the array
                    if (socket.id == currentUsers[i].id) {  //Find the correct user
                        old = currentUsers[i].username; //Keep track of their old username
                        currentUsers[i].username = new_name;    //Set their new username
                        break;  //Break out of loop
                    }
                }
                // console.log(currentUsers);
                io.emit('manageUsers', currentUsers, false);    //Change the list of users in the sidebar.
                //Prompt all the users of the namechange of that user.
                io.emit('message', makeMessage('Server', old + " has changed their name to " + new_name,undefined, true), "server");
            }
        }
    });

    //Event for when socket wants to change color.
    //colorHex: The hex code desired by the user.
    socket.on('changecolor', colorHex => {
        let hexStr = colorHex.substring(1);     //Remove the "#" from the hex for now.
        hexStr.trim();  //Trim any odd whitespace
        let regex_check = /^[0-9a-fA-F]+$/; //Regex to check if the input is valid.
        let valid;  //Valid boolean
        if (regex_check.test(hexStr) && hexStr.length == 6) {   //If the string is hexadecimal and of length 6,
            valid = true;   //Then valid is true
        } else {
            valid = false;  //Otherwise it is false.
        }

        //If the input is valid
        if (valid == true) {
            for (let i in currentUsers) {   //Look for the user via id
                if (socket.id == currentUsers[i].id) {
                    currentUsers[i].color = "#" + hexStr;   //Set their color to their desired input.
                } 
            }
            //Notify the user that their username color has successfully changed
            socket.emit('message', makeMessage('Server', "Color changed successfully.", undefined, false), "server");
            // console.log(currentUsers);
        } else {
            //Else notify the user that there was a problem changing their color.
            socket.emit('message', makeMessage('Server', "Could not change color. Please make sure the color format is in hexadecimal values. e.g. /changecolor #9534eb", undefined, false), "server");
        }
    });


});

//Allow the server to listen for connections.
server.listen(3000, () => {
    console.log('Server listening on port 3000.');
});