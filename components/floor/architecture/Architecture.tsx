"use client";
import {RoundedBox} from "@react-three/drei";
import * as THREE from "three";
import {doors,FLOOR_CONFIG,rooms,wallSegments,windows,type Room} from "../data/floor8";
import {materials} from "../materials/materials";
function roundedFloorShape(){const s=new THREE.Shape();s.moveTo(-9.5,-28);s.lineTo(9.5,-28);s.lineTo(9.5,24);s.quadraticCurveTo(9.5,28,5.5,28);s.lineTo(-5.5,28);s.quadraticCurveTo(-9.5,28,-9.5,24);s.closePath();return s}
export function Architecture({selected,onSelect,showCeiling=false}:{selected:Room;onSelect:(r:Room)=>void;showCeiling?:boolean}){return <group name="Floor08">
 <group name="Floors"><mesh rotation-x={-Math.PI/2} receiveShadow><shapeGeometry args={[roundedFloorShape()]}/><meshStandardMaterial {...materials.floor}/></mesh>{rooms.map(r=><mesh key={r.id} name={r.id} rotation-x={-Math.PI/2} position={[r.x,.012,r.z]} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor="pointer"}} onPointerOut={()=>document.body.style.cursor="default"} onClick={e=>{e.stopPropagation();onSelect(r)}}><planeGeometry args={[r.w-.22,r.d-.22]}/><meshStandardMaterial color={selected.id===r.id?materials.selectedFloor.color:"#aeb5bc"} transparent opacity={selected.id===r.id?.72:.38}/></mesh>)}</group>
 <group name="Walls">{wallSegments.map(w=><mesh key={w.id} name={w.id} position={[w.x,w.height/2,w.z]} castShadow receiveShadow><boxGeometry args={[w.width,w.height,w.depth]}/><meshStandardMaterial {...materials.wall}/></mesh>)}</group>
 <group name="Doors">{doors.map(d=><group key={d.id} name={d.id} position={[d.x,d.height/2,d.z]} rotation-y={d.rotation}><mesh castShadow><boxGeometry args={[d.width,d.height,.09]}/><meshStandardMaterial {...materials.door}/></mesh><mesh position={[-.38,0,.07]}><sphereGeometry args={[.04,10,10]}/><meshStandardMaterial color="#d6ad58" metalness={.7}/></mesh></group>)}</group>
 <group name="Windows">{windows.map(w=><mesh key={w.id} name={w.id} position={[w.x,w.sill+w.height/2,w.z]} rotation-y={w.rotation}><boxGeometry args={[w.width,w.height,.08]}/><meshStandardMaterial {...materials.window} transparent opacity={.42}/></mesh>)}</group>
 <group name="CurvedHall"><RoundedBox args={[19,.22,8]} radius={2.2} smoothness={5} position={[0,.1,25]} receiveShadow><meshStandardMaterial color="#9ea6af"/></RoundedBox></group>
 {showCeiling&&<mesh position={[0,FLOOR_CONFIG.ceilingHeight,-1]} rotation-x={Math.PI/2}><shapeGeometry args={[roundedFloorShape()]}/><meshStandardMaterial {...materials.ceiling} side={THREE.DoubleSide}/></mesh>}
 </group>}
