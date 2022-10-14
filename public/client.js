const socket = io();

const chat_msg = document.querySelector('#chatMessages');

//To grab the data inputted by the form when the user joins.
const { usern, color } = Qs.parse(location.search, {ignoreQueryPrefix: true});

//Send response to the server to join the chat.
socket.emit('joinChat', { usern, color });

//Take in a message OBJECT and then send it for output with output function.
//message: Message object to be sent in for output
//type: Type of message being output
socket.on('message', (message,type) => {
    output(message,type);   //Send to function
    chat_msg.scrollTop = chat_msg.scrollHeight; //Scrollto the bottom of the chat.
});

//Event listener for when the server needs to remake the list of online users
//list: List of users
socket.on('manageUsers', list => {
    remakeList(list);   //Send list to function
});

//To remove the text in the input bar at the bottom after a message is sent.
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.input.value;
    msg.trim();
    //result = msg.startsWith("/changename ");

    //If the message starts with /changename , then we send a response to the server to change their username
    if (msg.startsWith("/changename ")) {
        desired_name = msg.substring(12);   //Grab the desired username after the command
        socket.emit('changeusername', desired_name);    //Send response to the server.  
    //Else if the message starst with /changecolor, then we send a response to the server to change their color
    } else if (msg.startsWith("/changecolor ")) {
        desired_color = msg.substring(13);  //Grab the desired color after the command
        socket.emit('changecolor', desired_color);  //Send response to the server
    } else {
        socket.emit('chatmessage', msg);    //Else, it's just a normal message, send it to the server.
    }
    e.target.elements.input.value='';   //Erase the input in the input bar after sending a message.
});

//Function to output the message for all other connections except the person that sent the msg.
//message: message object passed in created by the server
//type: The type of message that is sent.
function output(message,type) {
    const new_message = document.createElement('div');  //Create a new html element
    new_message.setAttribute("id","message");   //Set the id as the message for css styling

    //Below, set the inner html to otherwise style the message based on the object values.
    new_message.innerHTML = `<p id="name-time" style="color:${message.colorHex}">${message.username}</p>
    <p id="name-time">at ${message.time}</p>
    <p id="msg-content">
    ${message.msg}
    </p>`;

    //If the type is single, then we style the message differently.
    if (type == "single") {
        new_message.style.backgroundColor = '#454545';
        new_message.style.border = '4px solid #329bd6';
    }

    //If hte type is server, then we style the message differently.
    if (type == "server") {
        new_message.style.backgroundColor = '#0f4c73';
    }

    //Append the new child the chatMessages div.
    document.getElementById('chatMessages').appendChild(new_message);
}

//Function to remake the list on the sidebar for connected users
//newList: List of users to make the list with.
function remakeList(newList) {
    //Get the list by element.
    const list = document.getElementById('user-list');
    //We loop through and remove every single list item.
    while (list.hasChildNodes()) {
        list.removeChild(list.firstChild);  //Remove the first list item
    }
    //Go through each object in the list, and add it to the list of online users.
    for (let x in newList) {
        let username = (newList[x].username);   //Get username of the object at x
        const new_user = document.createElement('li');  //Create a new list object
        new_user.setAttribute('id','user-list-item');
        new_user.innerHTML = username;  //Set the inner html to the username
        document.getElementById('user-list').appendChild(new_user); //Get the list by id and append the new list item.
    }
}
