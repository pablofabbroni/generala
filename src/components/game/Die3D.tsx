"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useSound } from "@/hooks/useSound";

interface Die3DProps {
    value: number;
    rollKey: number;  // Increments every roll — ensures physics re-fires even if value is same
    dieIndex: number; // Stable index (0-4), used to compute deterministic spawn position
    onStable?: (value: number) => void;
    locked?: boolean;
}

const TARGET_ROTATIONS: Record<number, [number, number, number]> = {
    1: [-Math.PI / 2, 0, 0],
    2: [0, 0, 0],
    3: [0, 0, Math.PI / 2],
    4: [0, 0, -Math.PI / 2],
    5: [Math.PI, 0, 0],
    6: [Math.PI / 2, 0, 0],
};

// Deterministic spread for each die index — max X is 3, safely away from the separator wall (x=5)
const SPAWN_OFFSETS: [number, number, number][] = [
    [-3.5, 5, -1],
    [-1.5, 6, 1],
    [0, 5, -1.2],
    [1.5, 6, 1.2],
    [3, 5, 0],
];

// Deterministic locked positions on the far right — past the separator wall
const LOCKED_POSITIONS: THREE.Vector3[] = [
    new THREE.Vector3(6.0, 0.6, -1.5),
    new THREE.Vector3(6.0, 0.6, -0.75),
    new THREE.Vector3(6.0, 0.6, 0),
    new THREE.Vector3(6.0, 0.6, 0.75),
    new THREE.Vector3(6.0, 0.6, 1.5),
];

export function Die3D({ value, rollKey, dieIndex, onStable, locked }: Die3DProps) {
    const rigidBody = React.useRef<RapierRigidBody>(null);
    const [isStable, setIsStable] = React.useState(false);
    const [isFrozen, setIsFrozen] = React.useState(false);
    const { playSound } = useSound();
    const lastHitTime = React.useRef(0);
    const freezeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const spawnOffset = SPAWN_OFFSETS[dieIndex] ?? SPAWN_OFFSETS[0];

    const handleCollision = (event: any) => {
        const now = Date.now();
        if (now - lastHitTime.current > 150 && event.totalForceMagnitude > 300) {
            const pitch = 0.7 + Math.random() * 0.3;
            playSound("diceHit", { pitch, volume: 0.18 });
            lastHitTime.current = now;
        }
    };

    // Apply initial impulse when value changes and NOT locked
    React.useEffect(() => {
        if (rigidBody.current && !locked) {
            setIsStable(false);
            setIsFrozen(false);

            // Clear any previous freeze timer
            if (freezeTimer.current) clearTimeout(freezeTimer.current);

            // Use the deterministic spawn offset + small random variation so they start separated
            const startPos = {
                x: spawnOffset[0] + (Math.random() - 0.5) * 1.0,
                y: spawnOffset[1],
                z: spawnOffset[2] + (Math.random() - 0.5) * 0.5,
            };
            rigidBody.current.setTranslation(startPos, true);
            rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            rigidBody.current.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true);

            // Very small lateral variation — dice drop mostly straight, no long slides
            rigidBody.current.applyImpulse(
                {
                    x: (Math.random() - 0.5) * 2.5,
                    y: -28,
                    z: (Math.random() - 0.5) * 2.0,
                },
                true
            );

            rigidBody.current.applyTorqueImpulse(
                {
                    x: (Math.random() - 0.5) * 12,
                    y: (Math.random() - 0.5) * 12,
                    z: (Math.random() - 0.5) * 12,
                },
                true
            );

            // Hard freeze after 1.2s — eliminates ALL residual vibration
            freezeTimer.current = setTimeout(() => {
                if (rigidBody.current && !locked) {
                    rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                    setIsStable(true);
                    setIsFrozen(true);
                }
            }, 1200);
        }

        return () => {
            if (freezeTimer.current) clearTimeout(freezeTimer.current);
        };
    }, [rollKey]); // rollKey changes every roll — fires even if value is same

    // When die becomes LOCKED — immediately freeze it in place (no movement)
    React.useEffect(() => {
        if (locked && rigidBody.current) {
            if (freezeTimer.current) clearTimeout(freezeTimer.current);
            // Instantly kill all velocity so die stays exactly where it is
            rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            setIsStable(true);
            setIsFrozen(true);
        }
    }, [locked]); // eslint-disable-line

    useFrame((_state, delta) => {
        if (!rigidBody.current) return;
        if (locked) return; // Locked dice stay exactly where they are — no movement

        const velocity = rigidBody.current.linvel();
        const angVelocity = rigidBody.current.angvel();

        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
        const angSpeed = Math.sqrt(angVelocity.x ** 2 + angVelocity.y ** 2 + angVelocity.z ** 2);

        if (speed < 2.0 && angSpeed < 2.0) {
            const targetRot = TARGET_ROTATIONS[value as keyof typeof TARGET_ROTATIONS];
            if (targetRot) {
                const currentQuat = new THREE.Quaternion(
                    rigidBody.current.rotation().x,
                    rigidBody.current.rotation().y,
                    rigidBody.current.rotation().z,
                    rigidBody.current.rotation().w
                );
                const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRot));

                if (speed < 0.15 && angSpeed < 0.15) {
                    if (!isStable) {
                        setIsStable(true);
                        rigidBody.current.setRotation(targetQuat, true);
                        onStable?.(value);
                    }
                } else {
                    currentQuat.slerp(targetQuat, delta * 8);
                    rigidBody.current.setRotation(currentQuat, true);
                }
            }
        } else if (isStable) {
            setIsStable(false);
        }
    });

    return (
        <RigidBody
            ref={rigidBody}
            position={spawnOffset}
            colliders="cuboid"
            restitution={0.05}
            friction={2.0}
            linearDamping={3.5}
            angularDamping={4.0}
            onCollisionEnter={handleCollision}
            type={locked ? "fixed" : "dynamic"}
        >
            <RoundedBox args={[1, 1, 1]} radius={0.12} smoothness={5} castShadow receiveShadow>
                <meshStandardMaterial
                    color={locked ? "#fbbf24" : "#ffffff"}
                    roughness={0.05}
                    metalness={0.1}
                    envMapIntensity={1.5}
                />
                <DieDots />
            </RoundedBox>
        </RigidBody>
    );
}

function DieDots() {
    return (
        <group>
            {/* 1: Front */}
            <mesh position={[0, 0, 0.51]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="black" />
            </mesh>

            {/* 2: Top */}
            <group position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[-0.25, 0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.25, -0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </group>

            {/* 3: Right */}
            <group position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh position={[-0.25, 0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.25, -0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </group>

            {/* 4: Left */}
            <group position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh position={[-0.25, 0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.25, 0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[-0.25, -0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.25, -0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </group>

            {/* 5: Bottom */}
            <group position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh position={[-0.25, 0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.25, 0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[-0.25, -0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[0.25, -0.25, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </group>

            {/* 6: Back */}
            <group position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]}>
                {[-0.25, 0, 0.25].map((x) =>
                    [-0.25, 0.25].map((y) => (
                        <mesh key={`${x}-${y}`} position={[x, y, 0]}>
                            <circleGeometry args={[0.08, 32]} />
                            <meshBasicMaterial color="black" />
                        </mesh>
                    ))
                )}
            </group>
        </group>
    );
}
