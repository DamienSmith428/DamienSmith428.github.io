function getParam(name){

let url=new URL(window.location.href);

return url.searchParams.get(name);

}

let token=getParam("token");

console.log("Payload received token:",token);

/*
This is where the native payload
would receive the token.

Example environment variable:
*/

window.LSO_TOKEN=token;

/*
Trigger the native payload loader.
In a real PS4 exploit host this
would call the ROP chain loader.
*/

alert("Payload loaded with token: "+token);
