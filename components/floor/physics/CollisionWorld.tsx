"use client";
import {CuboidCollider,RigidBody} from "@react-three/rapier";
import {FLOOR_CONFIG,wallSegments} from "../data/floor8";
export function CollisionWorld(){return <group name="CollisionWorld">
 <RigidBody type="fixed" colliders={false}><CuboidCollider args={[FLOOR_CONFIG.width/2,.1,FLOOR_CONFIG.depth/2]} position={[0,-.1,0]}/>{wallSegments.map(w=><CuboidCollider key={w.id} args={[w.width/2,w.height/2,w.depth/2]} position={[w.x,w.height/2,w.z]}/>)}</RigidBody>
 </group>}
