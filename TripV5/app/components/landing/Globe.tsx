"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { sevenWonders } from "@/data/wonders";
import type { Wonder } from "@/types";

const EARTH_TEXTURE_URL =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Earth({
  onWonderClick,
  selectedWonder,
}: {
  onWonderClick: (w: Wonder) => void;
  selectedWonder: Wonder | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URL);

  useFrame(() => {
    if (meshRef.current && !selectedWonder) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Wonder markers */}
      {sevenWonders.map((wonder) => {
        const pos = latLonToVector3(wonder.lat, wonder.lng, 2.06);
        const isSelected = selectedWonder?.name === wonder.name;
        return (
          <mesh
            key={wonder.name}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              onWonderClick(wonder);
            }}
          >
            <sphereGeometry args={[isSelected ? 0.06 : 0.04, 16, 16]} />
            <meshBasicMaterial
              color={isSelected ? "#f59e0b" : "#14b8a6"}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function GlobeLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );
}

export default function Globe() {
  const [selectedWonder, setSelectedWonder] = useState<Wonder | null>(null);

  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">
          Explore the Seven Wonders
        </h2>
        <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
          Click on any wonder to learn more. Drag to rotate the globe.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Wonder buttons — left */}
          <div className="hidden lg:flex flex-col gap-3">
            {sevenWonders.slice(0, 4).map((w) => (
              <button
                key={w.name}
                onClick={() => setSelectedWonder(w)}
                className={`text-left px-4 py-3 rounded-lg transition-all ${
                  selectedWonder?.name === w.name
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent"
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>

          {/* Globe canvas */}
          <div className="aspect-square w-full max-w-[500px] mx-auto">
            <Suspense fallback={<GlobeLoader />}>
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 3, 5]} intensity={1} />
                <Earth
                  onWonderClick={setSelectedWonder}
                  selectedWonder={selectedWonder}
                />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate={!selectedWonder}
                  autoRotateSpeed={0.5}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={(3 * Math.PI) / 4}
                />
              </Canvas>
            </Suspense>
          </div>

          {/* Wonder buttons — right */}
          <div className="hidden lg:flex flex-col gap-3">
            {sevenWonders.slice(4).map((w) => (
              <button
                key={w.name}
                onClick={() => setSelectedWonder(w)}
                className={`text-left px-4 py-3 rounded-lg transition-all ${
                  selectedWonder?.name === w.name
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent"
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>

          {/* Mobile wonder buttons */}
          <div className="flex lg:hidden overflow-x-auto gap-3 pb-2 col-span-full">
            {sevenWonders.map((w) => (
              <button
                key={w.name}
                onClick={() => setSelectedWonder(w)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                  selectedWonder?.name === w.name
                    ? "bg-teal-500 text-white"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected wonder info */}
        {selectedWonder && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {selectedWonder.name}
            </h3>
            <p className="text-gray-400">{selectedWonder.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}
