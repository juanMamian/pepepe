
let hostLocation = window.location.host;
if(hostLocation.includes("localhost")){
  hostLocation="localhost:3000";
} 
console.log(`Host location: ${hostLocation}`);



let protocolPart = "http://";
let wsProtocolPart="ws://";

if(hostLocation.includes("heroku")){
  console.log(`Protocolo https`);
  protocolPart="https://";
    wsProtocolPart="wss://";
}

export let serverUrl=protocolPart + hostLocation + "/graphql";
export let wsServerUrl=wsProtocolPart + hostLocation + "/graphql";

