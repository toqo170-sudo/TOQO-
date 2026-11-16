
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
const wss = new WebSocketServer({ port: 2567 });
const players = new Map();
function broadcast(){
 const snapshot=[...players.values()].map(({id,x,z,rot})=>({id,x,z,rot}));
 for(const p of wss.clients) if(p.readyState===1) p.send(JSON.stringify({type:'state',id:p.playerId,players:snapshot}));
}
wss.on('connection', ws=>{
 const id=randomUUID().slice(0,8);
 ws.playerId=id;
 players.set(id,{id,x:(Math.random()-.5)*12,z:5+Math.random()*8,rot:0});
 ws.on('message',raw=>{
  let msg;try{msg=JSON.parse(raw.toString())}catch{return}
  const p=players.get(id);if(!p)return;
  if(msg.type==='move'){
   // Basic server-side bounds and type validation; production games need authoritative physics and anti-cheat.
   p.x=Math.max(-95,Math.min(95,Number(msg.x)||0));
   p.z=Math.max(-95,Math.min(95,Number(msg.z)||0));
   p.rot=Number(msg.rot)||0;
  }
 });
 ws.on('close',()=>{players.delete(id);broadcast()});
 broadcast();
});
console.log('TOQO WebSocket server listening on ws://0.0.0.0:2567');
