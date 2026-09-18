export type Vec2=[number,number];
export type Vec3=[number,number,number];
export type Room={id:string;number?:string;name:string;type:string;floor:number;area:number;x:number;z:number;w:number;d:number;polygon:Vec2[];cameraSpawn:Vec3};
export type WallSegment={id:string;x:number;z:number;width:number;depth:number;height:number;thickness:number;kind:"exterior"|"interior"};
export type DoorData={id:string;x:number;z:number;rotation:number;width:number;height:number;roomId?:string};
export type WindowData={id:string;x:number;z:number;width:number;height:number;sill:number;rotation:number};

export const FLOOR_CONFIG={floor:8,width:19,depth:56,ceilingHeight:3,eyeHeight:1.7,exteriorWallThickness:.32,interiorWallThickness:.18,doorWidth:1.05,doorHeight:2.1,corridorWidth:5} as const;
const rect=(x:number,z:number,w:number,d:number):Vec2[]=>[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];
const room=(id:string,number:string|undefined,name:string,type:string,area:number,x:number,z:number,w:number,d:number):Room=>({id,number,name,type,floor:8,area,x,z,w,d,polygon:rect(x,z,w,d),cameraSpawn:[x,1.7,z]});

export const rooms:Room[]=[
 room("room_801","801","Кабинет 801","Офис",29,-6,-21.5,7,6),room("room_802","802","Кабинет 802","Офис",29,6,-21.5,7,6),
 room("room_803","803","Кабинет 803","Офис",29,-6,-14.5,7,6),room("room_804","804","Кабинет 804","Офис",29,6,-14.5,7,6),
 room("room_805","805","Кабинет 805","Офис",29,-6,-7.5,7,6),room("room_806","806","Кабинет 806","Офис",29,6,-7.5,7,6),
 room("room_807","807","Кабинет 807","Офис",29,-6,-.5,7,6),room("room_808","808","Кабинет 808","Офис",29,6,-.5,7,6),
 room("room_809","809","Кабинет 809","Офис",29,-6,6.5,7,6),room("room_810","810","Кабинет 810","Офис",29,6,6.5,7,6),
 room("room_811","811","Кабинет 811","Офис",29,-6,13.5,7,6),room("room_812","812","Кабинет 812","Офис",29,6,13.5,7,6),
 room("stairs_01",undefined,"Лестница","Эвакуационная зона",20,-7.65,21,3.5,7),room("wc_01",undefined,"Санузел 01","Санузел",18,-4.15,21,3.5,7),
 room("elevator_01",undefined,"Лифтовая шахта","Техническая зона",18,4.15,21,3.5,7),room("tech_01",undefined,"Техническое помещение","Инженерная зона",20,7.65,21,3.5,7),
 room("terrace_01",undefined,"Закруглённый холл","Общая зона",100,0,26,18,8)
];

const rowBoundaries=[-24.5,-17.5,-10.5,-3.5,3.5,10.5,17.5];
const doorCenters=[-21.5,-14.5,-7.5,-.5,6.5,13.5,21];
const walls:WallSegment[]=[];
const add=(id:string,x:number,z:number,width:number,depth:number,kind:WallSegment["kind"]="interior")=>walls.push({id,x,z,width,depth,height:FLOOR_CONFIG.ceilingHeight,thickness:kind==="exterior"?FLOOR_CONFIG.exteriorWallThickness:FLOOR_CONFIG.interiorWallThickness,kind});
add("exterior_west",-9.5,-1,.32,50,"exterior");add("exterior_east",9.5,-1,.32,50,"exterior");add("exterior_north",0,-26,19,.32,"exterior");
rowBoundaries.forEach((z,i)=>{add(`cross_w_${i}`,-6,z,7,.18);add(`cross_e_${i}`,6,z,7,.18)});
([-2.5,2.5] as const).forEach((x,side)=>{let start=-25.82;doorCenters.forEach((z,i)=>{const end=z-FLOOR_CONFIG.doorWidth/2;add(`corridor_${side}_${i}`,x,(start+end)/2,.18,end-start);start=z+FLOOR_CONFIG.doorWidth/2});add(`corridor_${side}_end`,x,(start+23.6)/2,.18,23.6-start)});
add("service_left_split",-6,21,3.5,.18);add("service_right_split",6,21,3.5,.18);add("service_end_w",-7.3,23.5,4.2,.18);add("service_end_e",7.3,23.5,4.2,.18);
export const wallSegments=walls;
export const doors:DoorData[]=doorCenters.flatMap((z,i)=>[
 {id:`door_w_${i}`,x:-2.5,z,rotation:-.92,width:FLOOR_CONFIG.doorWidth,height:FLOOR_CONFIG.doorHeight,roomId:rooms[i*2]?.id},
 {id:`door_e_${i}`,x:2.5,z,rotation:.92,width:FLOOR_CONFIG.doorWidth,height:FLOOR_CONFIG.doorHeight,roomId:rooms[i*2+1]?.id}
]);
export const windows:WindowData[]=[-7,-3.5,0,3.5,7].map((x,i)=>({id:`window_n_${i}`,x,z:-26.15,width:2.1,height:1.4,sill:.85,rotation:0}));
export const floor8={metadata:FLOOR_CONFIG,rooms,walls:wallSegments,doors,windows};
