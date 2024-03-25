const express = require('express')
const app = express()
const {PubSub} = require('@google-cloud/pubsub');
const WebSocket = require('ws');

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json())

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };


const subscriptionNameOrId = 'my-sub';
const timeout = 60;

const pubSubClient = new PubSub();


function listenForMessages(subscriptionNameOrId, timeout) {
const subscription = pubSubClient.subscription(subscriptionNameOrId);

  const subMessages = message => {
    wss.on('message', function incoming(message) {
        console.log(`'received: %s', ${message.data}`);

        wss.send(`${message.data}`)
      });



    wss.broadcast(`${message.data}`);
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    wss.on('connection', function connection(ws) {
        console.log('A new client connected');
        
        ws.on('message', function incoming(message) {
          console.log('received: %s', message);
        });

        ws.send(`${message.data}`)
      });
      message.ack()
    //   console.log(`Received message ${messages.data}:`);
  }
      
  subscription.on('message', subMessages);
  
  setTimeout(() => {
    subscription.removeListener('message', subMessages);
    // console.log(`${messageCount} message(s) received.`);
  }, timeout * 1000);
}
  
  
listenForMessages(subscriptionNameOrId, timeout)  



const PORT = 5000
server.listen(PORT, () => {
console.log(`Started sever at ${PORT}`)
})