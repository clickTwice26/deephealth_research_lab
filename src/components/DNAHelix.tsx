'use client';

import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Center, Instance, Instances } from '@react-three/drei';

export default function DNAHelix({ count = 40, radius = 2, height = 15, speed = 0.5, color1 = "#3b82f6", color2 = "#ec4899" }) {
    const groupRef = useRef<THREE.Group>(null);

    // Data for positions
    const { points1, points2, connectors } = useMemo(() => {
        const p1 = [];
        const p2 = [];
        const conns = [];

        // One full turn is 2*PI.
        const turns = 3;
        const itemsPerTurn = count / turns;
        const angleStep = (Math.PI * 2) / itemsPerTurn;
        const heightStep = height / count;

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            const y = (i * heightStep) - (height / 2);

            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;

            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;

            p1.push(new THREE.Vector3(x1, y, z1));
            p2.push(new THREE.Vector3(x2, y, z2));
            conns.push({ start: new THREE.Vector3(x1, y, z1), end: new THREE.Vector3(x2, y, z2) });
        }

        return { points1: p1, points2: p2, connectors: conns };
    }, [count, radius, height]);

    useFrame((state) => {
        if (groupRef.current) {
            // Use absolute time for perfectly smooth infinite rotation without accumulation errors
            // Speed 0.5 rad/s
            groupRef.current.rotation.y = state.clock.elapsedTime * speed;
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                {/* Instanced Strand 1 */}
                <Instances range={count}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={0.5} />
                    {points1.map((pos, i) => (
                        <Instance key={`s1-${i}`} position={pos} />
                    ))}
                </Instances>

                {/* Instanced Strand 2 */}
                <Instances range={count}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.5} />
                    {points2.map((pos, i) => (
                        <Instance key={`s2-${i}`} position={pos} />
                    ))}
                </Instances>

                {/* Connectors - Using Instances implies same geometry. scaling cylinders is tricky if lengths differ, but here they are uniform radius. Length is constant 2*radius? Actually diameter is constant. Distance between helix strands is constant 2*radius. So we can instance them easily. */}
                <Instances range={count}>
                    <cylinderGeometry args={[0.05, 0.05, radius * 2, 8]} />
                    <meshStandardMaterial color="#cbd5e1" transparent opacity={0.3} />
                    {connectors.map((conn, i) => (
                        <CylinderInstance key={`conn-${i}`} start={conn.start} end={conn.end} />
                    ))}
                </Instances>
            </Center>
        </group>
    );
}

function CylinderInstance({ start, end }: { start: THREE.Vector3, end: THREE.Vector3 }) {
    const position = useMemo(() => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5), [start, end]);

    // We know the cylinder geometry is created vertical (Y-axis).
    // The strand connection is horizontal-ish.
    // Actually, in this helix generation, the two points are exactly opposite on the circle, same Y.
    // So the connection is always horizontal, passing through the Y-axis.
    // The angle of the connection matches the angle of the points.

    // Calculate rotation to align Y-axis with the vector (end - start).
    const direction = useMemo(() => new THREE.Vector3().subVectors(end, start).normalize(), [start, end]);
    const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction), [direction]);

    return <Instance position={position} quaternion={quaternion} />;
}
