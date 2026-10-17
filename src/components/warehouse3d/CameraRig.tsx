"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type PresetCamera = "isometrica" | "topo" | "corredor";

interface CameraRigProps {
  preset: PresetCamera;
  ruaFocoZ: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

function alvoDoPreset(preset: PresetCamera, ruaFocoZ: number) {
  if (preset === "topo") {
    return { posicao: new THREE.Vector3(6, 26, 14), alvo: new THREE.Vector3(6, 0, 14) };
  }
  if (preset === "corredor") {
    return { posicao: new THREE.Vector3(1, 1.6, ruaFocoZ), alvo: new THREE.Vector3(10, 1, ruaFocoZ) };
  }
  return { posicao: new THREE.Vector3(16, 14, 32), alvo: new THREE.Vector3(6, 1, 14) };
}

export function CameraRig({ preset, ruaFocoZ, controlsRef }: CameraRigProps) {
  const { camera } = useThree();
  const destino = useRef(alvoDoPreset(preset, ruaFocoZ));
  const transicionando = useRef(false);

  useEffect(() => {
    destino.current = alvoDoPreset(preset, ruaFocoZ);
    transicionando.current = true;
  }, [preset, ruaFocoZ]);

  useFrame(() => {
    if (!transicionando.current) return;
    const controls = controlsRef.current;
    camera.position.lerp(destino.current.posicao, 0.06);
    if (controls) {
      controls.target.lerp(destino.current.alvo, 0.06);
      controls.update();
    }
    if (camera.position.distanceTo(destino.current.posicao) < 0.05) {
      transicionando.current = false;
    }
  });

  return null;
}
