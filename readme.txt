README for assignment 2

Code inspirations:
General Socket.io inspiration from ChatCord by Brad Traversy/Traversy Media. Link to github: https://github.com/bradtraversy/chatcord
Numerous resources from W3schools. Link: https://www.w3schools.com/js/

How to run Chatroom.IO application:

1. Make sure to have correct dependencies listed in package.json.
    "express": "^4.17.3",
    "moment": "^2.29.1"
    "socket.io": "^4.4.1"

2. Open up a terminal with powershell. Put in command "node server.js". 
If working correctly, console should output "Server listening on port 3000."

3. Open preferred browser (e.g. Chrome, Firefox, Edge) and input "localhost:3000" in the url.

4. If working correctly, browser should send you to a login screen with a title called "Chatroom.IO".

5. Input username (if desired) and choose color with the dropdown menu (if desired).


Afterwards, you should be redirected to a chatroom window.

To send messages, simply type in the input bar at the bottom, and submit with the enter key or clicking the send button.

To change your username, type in the command "/changename " and then your desired username. There should be a singular space between the
command and your desired username. Due to preference, your username cannot be larger than 16 characters. It can also not be the same as any
other username in the chat. You will be prompted if your username is accepted or denied by the server.

To change the color of your username, type in the command "/changecolor " and then your desired color in HEXADECIMAL. (e.g. /changecolor #3f3f3f).
The server will prompt you if there is an invalid input or if your color was successfully changed. Like the changename command, there should be
a singular space between the command and the desired hex code. There should be no whitespace after the hex code.

To test other connections, simply open other tabs and follow steps 1-5 once again. The list of connected users will be displayed on the right
under "Users in Chatroom" with their corresponding username.