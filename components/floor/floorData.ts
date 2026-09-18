export type Room={id:string;name:string;type:string;floor?:number;area:number;x:number;z:number;w:number;d:number;cameraSpawn:[number,number,number];polygon?:[number,number][]};
export const FLOOR_W=19,FLOOR_D=56,CORRIDOR_W=5;
export const rooms:Room[]=[
 {id:"room_801",name:"Кабинет 801",type:"Офис",area:29,x:-6,z:-21.5,w:7,d:6,cameraSpawn:[-6,1.7,-21.5]},
 {id:"room_802",name:"Кабинет 802",type:"Офис",area:29,x:6,z:-21.5,w:7,d:6,cameraSpawn:[6,1.7,-21.5]},
 {id:"room_803",name:"Кабинет 803",type:"Офис",area:29,x:-6,z:-14.5,w:7,d:6,cameraSpawn:[-6,1.7,-14.5]},
 {id:"room_804",name:"Кабинет 804",type:"Офис",area:29,x:6,z:-14.5,w:7,d:6,cameraSpawn:[6,1.7,-14.5]},
 {id:"room_805",name:"Кабинет 805",type:"Офис",area:29,x:-6,z:-7.5,w:7,d:6,cameraSpawn:[-6,1.7,-7.5]},
 {id:"room_806",name:"Кабинет 806",type:"Офис",area:29,x:6,z:-7.5,w:7,d:6,cameraSpawn:[6,1.7,-7.5]},
 {id:"room_807",name:"Кабинет 807",type:"Офис",area:29,x:-6,z:-.5,w:7,d:6,cameraSpawn:[-6,1.7,-.5]},
 {id:"room_808",name:"Кабинет 808",type:"Офис",area:29,x:6,z:-.5,w:7,d:6,cameraSpawn:[6,1.7,-.5]},
 {id:"room_809",name:"Кабинет 809",type:"Офис",area:29,x:-6,z:6.5,w:7,d:6,cameraSpawn:[-6,1.7,6.5]},
 {id:"room_810",name:"Кабинет 810",type:"Офис",area:29,x:6,z:6.5,w:7,d:6,cameraSpawn:[6,1.7,6.5]},
 {id:"room_811",name:"Кабинет 811",type:"Офис",area:29,x:-6,z:13.5,w:7,d:6,cameraSpawn:[-6,1.7,13.5]},
 {id:"room_812",name:"Кабинет 812",type:"Офис",area:29,x:6,z:13.5,w:7,d:6,cameraSpawn:[6,1.7,13.5]},
 {id:"stairs_01",name:"Лестница",type:"Эвакуационная зона",area:20,x:-7.65,z:21,w:3.5,d:7,cameraSpawn:[-7.65,1.7,21]},
 {id:"wc_01",name:"Санузел 01",type:"Санузел",area:18,x:-4.15,z:21,w:3.5,d:7,cameraSpawn:[-4.15,1.7,21]},
 {id:"elevator_01",name:"Лифтовая шахта",type:"Техническая зона",area:18,x:4.15,z:21,w:3.5,d:7,cameraSpawn:[4.15,1.7,21]},
 {id:"tech_01",name:"Техническое помещение",type:"Инженерная зона",area:20,x:7.65,z:21,w:3.5,d:7,cameraSpawn:[7.65,1.7,21]},
 {id:"terrace_01",name:"Закруглённый холл",type:"Общая зона",area:100,x:0,z:26,w:18,d:8,cameraSpawn:[0,1.7,25]}];
export const materialConfig = {
  wall: { color: "#efeae3", roughness: 0.88 },
  floor: { color: "#d7c7b2", roughness: 0.9 },
  corridor: { color: "#c9b49a", roughness: 0.92 },
  roomFloor: { color: "#e6d8c6", roughness: 0.9 },
  selectedFloor: { color: "#4ea3ff", roughness: 0.7 },
  skirting: { color: "#5a4a3c", roughness: 0.85 },
  roomEdge: { color: "#6b5746" },
  selectedEdge: { color: "#d7ecff" },
  door: { color: "#7a4c2d", roughness: 0.7 },
  window: { color: "#bce7ff", opacity: 0.42 },
  ceiling: { color: "#fff", roughness: 0.9 },
};
