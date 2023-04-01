
let hostLocation = window.location.host;
if(hostLocation.includes("localhost")){
  hostLocation="localhost:3000";
} 

//Replace 5173 with 3000;
if(hostLocation.includes("5173")){
  hostLocation=hostLocation.replace("5173","3000");
}

console.log(`Host location: ${hostLocation}`);



let protocolPart = "http://";
let wsProtocolPart="ws://";

if(hostLocation.includes("heroku")){
  console.log(`Protocolo https`);
  protocolPart="https://";
    wsProtocolPart="wss://";
}

export let serverUrl=protocolPart + hostLocation;
export let wsServerUrl=wsProtocolPart + hostLocation;

