"use client";
import {Canvas} from "@react-three/fiber";
import {Environment,OrbitControls} from "@react-three/drei";
import {Physics} from "@react-three/rapier";
import {XR,createXRStore} from "@react-three/xr";
import {Suspense,useEffect,useMemo,useState} from "react";
import {Architecture} from "./architecture/Architecture";
import {CollisionWorld} from "./physics/CollisionWorld";
import {Player} from "./player/Player";
import type {Room} from "./data/floor8";
import type {ViewMode} from "@/app/page";

const xrStore=createXRStore();
function MobilePad(){const press=(code:string,on:boolean)=>window.dispatchEvent(new KeyboardEvent(on?"keydown":"keyup",{code}));return <div className="joystick" aria-label="Управление движением"><button onPointerDown={()=>press("KeyW",true)} onPointerUp={()=>press("KeyW",false)} onPointerCancel={()=>press("KeyW",false)}>▲</button><div><button onPointerDown={()=>press("KeyA",true)} onPointerUp={()=>press("KeyA",false)}>◀</button><button onPointerDown={()=>press("KeyS",true)} onPointerUp={()=>press("KeyS",false)}>▼</button><button onPointerDown={()=>press("KeyD",true)} onPointerUp={()=>press("KeyD",false)}>▶</button></div></div>}

export function FloorCanvas({mode,selected,onSelect}:{mode:ViewMode;selected:Room;onSelect:(r:Room)=>void}){
 const [vr,setVr]=useState(false),spawn=useMemo(()=>selected.cameraSpawn,[selected]);
 useEffect(()=>{navigator.xr?.isSessionSupported("immersive-vr").then(setVr).catch(()=>setVr(false))},[]);
 return <>
  <Canvas shadows camera={{position:mode==="walk"?spawn:[25,34,38],fov:52}} gl={{antialias:true}}>
   <XR store={xrStore}>
    <color attach="background" args={["#233144"]}/><fog attach="fog" args={["#233144",65,120]}/>
    <ambientLight intensity={1.15}/><directionalLight position={[12,28,8]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]}/>
    <Suspense fallback={null}><Physics gravity={[0,-18,0]} colliders={false} timeStep="vary">
     <Architecture selected={selected} onSelect={onSelect} showCeiling={mode==="walk"}/><CollisionWorld/>{mode==="walk"&&<Player spawn={spawn}/>} 
    </Physics></Suspense>
    {mode!=="walk"&&<OrbitControls makeDefault target={[0,0,0]} minDistance={18} maxDistance={85} maxPolarAngle={1.46}/>}<Environment preset="city"/>
   </XR>
  </Canvas>
  {mode==="walk"&&<MobilePad/>}<button className={`vr-button ${vr?"supported":""}`} onClick={()=>vr&&xrStore.enterVR()} disabled={!vr}>{vr?"Войти в VR":"VR недоступен"}</button>
 </>
}
