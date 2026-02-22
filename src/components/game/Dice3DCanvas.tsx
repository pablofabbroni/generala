"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, CuboidCollider, RigidBody } from "@react-three/rapier";
import { Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Die3D } from "./Die3D";
import { useGameStore } from "@/store/gameStore";

export function Dice3DCanvas() {
    const dice = useGameStore((s) => s.dice);
    const rollsLeft = useGameStore((s) => s.rollsLeft);
    const [mounted, setMounted] = React.useState(false);
    const [isThrowing, setIsThrowing] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Effect to trigger "throwing" state when rollsLeft changes
    React.useEffect(() => {
        if (rollsLeft < 3) {
            setIsThrowing(true);
            const timer = setTimeout(() => setIsThrowing(false), 400); // Matches DiceTray
            return () => clearTimeout(timer);
        }
    }, [rollsLeft]);

    if (!mounted) return <div className="h-[300px] w-full bg-black/20 animate-pulse rounded-3xl" />;

    return (
        <div className="h-[300px] w-full cursor-grab active:cursor-grabbing">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
                <React.Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 11, 0]} rotation={[-Math.PI / 2, 0, 0]} fov={45} />

                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
                    <pointLight position={[-10, 8, -10]} intensity={0.5} color="#f59e0b" />

                    <Physics gravity={[0, -40, 0]}>
                        {/* Floor (Matches Felt) */}
                        <RigidBody type="fixed" colliders="cuboid" restitution={0.1} friction={1}>
                            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                                <planeGeometry args={[50, 50]} />
                                <meshStandardMaterial color="#0d3d2e" roughness={1} metalness={0} />
                            </mesh>
                        </RigidBody>

                        {/* No separator wall needed — locked dice stay in place on the table */}

                        <ContactShadows
                            position={[0, 0.05, 0]}
                            opacity={0.6}
                            scale={20}
                            blur={2}
                            far={4.5}
                        />

                        {/* Invisible Walls to keep dice in view - Tightened further */}
                        <CuboidCollider args={[10, 10, 1]} position={[0, 5, 3.5]} />
                        <CuboidCollider args={[10, 10, 1]} position={[0, 5, -3.5]} />
                        <CuboidCollider args={[1, 10, 10]} position={[6, 5, 0]} />
                        <CuboidCollider args={[1, 10, 10]} position={[-6, 5, 0]} />

                        {dice.map((d, i) => (
                            <Die3D
                                key={i}
                                dieIndex={i}
                                value={d.value}
                                rollKey={d.rollKey ?? 0}
                                locked={d.locked}
                            />
                        ))}
                    </Physics>

                    <Environment preset="city" />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
