"use strict";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7265/chathub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

const start = async () => {
    try {
        await connection.start();
        console.log("Connected to signal r hub");
    } catch (error) {
        console.log(error);
    }
}

// getting the username from prompt modal and store in session storage
// session storage, exists till a browser tab is open
const joinUser = async () => {
    const name = window.prompt('Enter the name: ');
    if (name)
    {
        sessionStorage.setItem('user', name);   
        // here user will join the chat
        await joinChat(name);
    }
}

const joinChat = async (user) => {
    if (!user)
       return;
    try {
        const message = `${user} joined`;
        await connection.invoke("JoinChat", user, message);
    } catch (error) {
        console.log(error);
    }
}

// fetching the user from sesstion storage
const getUser = () => sessionStorage.getItem('user')

// method for getting notified by server
const receiveMessage = async () => {
    const currentUser = getUser();
    if (!currentUser)
        return;
    try {
        await connection.on("ReceiveMessage", (user, message) => {
         const messageClass = currentUser === user ? "send" : "received";
            appendMessage(message, messageClass);
            const alertSound = new Audio('chat-sound.mp3');
            alertSound.play();
       })
    } catch (error) {
        console.log(error);
    }
}

// append meessage to the message-section
const appendMessage = (message,messageClass) => {
    const messageSectionEl = document.getElementById('messageSection');
    const msgBoxEl = document.createElement("div");
    msgBoxEl.classList.add("msg-box");
    msgBoxEl.classList.add(messageClass);
    msgBoxEl.innerHTML = message;
    messageSectionEl.appendChild(msgBoxEl);
}

// binding the event for send button
document.getElementById('btnSend').addEventListener('click', async (e) => {
    e.preventDefault();
    const user = getUser();
    if (!user)
        return;
    const txtMessageEl = document.getElementById('txtMessage');
    const msg = txtMessageEl.value;
    if (msg) {
        // call the sendmessage api
        await sendMessage(user,`${user}: ${msg}`);  // john: hey guys
        txtMessageEl.value = "";
    }
})

const sendMessage = async (user,message) => {
    
    try {
        await connection.invoke('SendMessage', user, message);
    } catch (error) {
        console.log(error);
    }
}


// starting the app
const startApp = async () => {
    await start(); // connection will stablised
    await joinUser();
    await receiveMessage();
}

startApp();