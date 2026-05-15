import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useGraph } from '@react-three/fiber';
import { ContactShadows, Environment, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

function lerpBone(nodes, boneName, axis, target, alpha = 0.1) {
  const bone = nodes?.[boneName];
  if (!bone) return;
  bone.rotation[axis] = THREE.MathUtils.lerp(bone.rotation[axis], target, alpha);
}

const RobotModel = ({ interactive, mode = 'idle', stepIndex = 0, pointDirection = 'right' }) => {
  const group = useRef();
  const { scene } = useGLTF('/LumiBot-transformed.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const isTour = mode === 'tour';
    const isTips = mode === 'tips';
    const tourStep = ((stepIndex % 4) + 4) % 4;

    if (group.current) {
      const tourYOffset = [-0.05, -0.02, -0.02, -0.16];
      const baseY = isTips ? -0.97 : isTour ? -0.9 + tourYOffset[tourStep] : -0.9;
      const floatAmp = isTips ? 0.045 : 0.07;

      // Yaw del CUERPO por paso — gira hacia donde señala
      let bodyYaw = Math.sin(t * 0.35) * 0.12; // idle
      if (isTour) {
        if (tourStep === 0) bodyYaw = 0.55; // ← era -0.55
        if (tourStep === 1) bodyYaw = -0.55; // ← era  0.55
        if (tourStep === 2) bodyYaw = 0.40; // ← era -0.40
        if (tourStep === 3) bodyYaw = 0.00;
      }

      group.current.position.y = baseY + Math.sin(t * 1.35) * floatAmp;
      group.current.position.x = isTour
        ? Math.sin(t * 0.8 + stepIndex * 0.65) * 0.03
        : Math.sin(t * 0.9) * 0.02;
      group.current.rotation.z = Math.sin(t * 0.75) * 0.03;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, bodyYaw, 0.06);
    }

    // Cabeza: mira en la misma dirección que el cuerpo señala, con leve inclinación
    if (nodes.Head) {
      let headX = 0, headY = 0;
      if (isTour) {
        if (tourStep === 0) { headX = -0.15; headY = 0.20; } // ← era -0.20
        if (tourStep === 1) { headX = -0.10; headY = -0.60; } // ← era  0.20
        if (tourStep === 2) { headX = -0.0; headY = 0.30; } // ← era -0.30
        if (tourStep === 3) { headX = -0.28; headY = 0.00; }
      } else if (isTips) {
        headX = -0.08 + Math.sin(t * 1.5) * 0.04;
        headY = -0.20 + Math.sin(t * 0.9) * 0.06; // leve giro hacia las tarjetas
      }
      nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, headX, 0.06);
      nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, headY, 0.06);
    }

    // ── Brazos por modo ──────────────────────────────────────────
    if (isTour) {
      if (tourStep === 0) {
        // Paso 1: brazo IZQUIERDO señala noreste, derecho abajo
        lerpBone(nodes, 'LeftArm', 'x', -0.55, 0.14);
        lerpBone(nodes, 'LeftArm', 'z', 0.50, 0.14);
        lerpBone(nodes, 'LeftForeArm', 'x', -0.20, 0.14);

        lerpBone(nodes, 'RightArm', 'x', 0.25, 0.14);
        lerpBone(nodes, 'RightArm', 'z', 0.10, 0.14);
        lerpBone(nodes, 'RightForeArm', 'x', 0.05, 0.14);

      } else if (tourStep === 1) {
        // Paso 2: brazo DERECHO señala noroeste, izquierdo abajo
        lerpBone(nodes, 'RightArm', 'x', -0.55 + Math.sin(t * 1.8) * 0.05, 0.14);
        lerpBone(nodes, 'RightArm', 'z', -0.50, 0.14);
        lerpBone(nodes, 'RightForeArm', 'x', -0.20 + Math.sin(t * 2.1) * 0.05, 0.12);

        lerpBone(nodes, 'LeftArm', 'x', 0.25 + Math.sin(t * 1.4) * 0.03, 0.14);
        lerpBone(nodes, 'LeftArm', 'z', -0.10, 0.14);
        lerpBone(nodes, 'LeftForeArm', 'x', 0.05, 0.12);

      } else if (tourStep === 2) {
        // Paso 3: brazo IZQUIERDO señala al este (lateral derecho de pantalla), derecho abajo
        lerpBone(nodes, 'LeftArm', 'x', -0.15 + Math.sin(t * 1.8) * 0.04, 0.14);
        lerpBone(nodes, 'LeftArm', 'z', 0.75, 0.14); // muy abierto = este
        lerpBone(nodes, 'LeftForeArm', 'x', -0.10 + Math.sin(t * 2.1) * 0.04, 0.12);

        lerpBone(nodes, 'RightArm', 'x', 0.25 + Math.sin(t * 1.4) * 0.03, 0.14);
        lerpBone(nodes, 'RightArm', 'z', 0.10, 0.14);
        lerpBone(nodes, 'RightForeArm', 'x', 0.05, 0.12);

      } else {
        // Paso 4: ambos brazos abiertos noreste/noroeste
        lerpBone(nodes, 'LeftArm', 'x', -0.50 + Math.sin(t * 2.1) * 0.05, 0.14);
        lerpBone(nodes, 'RightArm', 'x', -0.50 + Math.sin(t * 2.1 + 0.8) * 0.05, 0.14);
        lerpBone(nodes, 'LeftArm', 'z', -0.55, 0.14);
        lerpBone(nodes, 'RightArm', 'z', 0.55, 0.14);
        lerpBone(nodes, 'LeftForeArm', 'x', -0.15 + Math.sin(t * 2.5) * 0.06, 0.12);
        lerpBone(nodes, 'RightForeArm', 'x', -0.15 + Math.sin(t * 2.5 + 0.9) * 0.06, 0.12);
      }

    } else if (isTips) {
      // Animación cíclica en 3 fases: señalar → abrir brazos → explicar
      const cycle = (t % 6); // ciclo de 6 segundos

      if (cycle < 2) {
        // FASE 1: brazo derecho señala las tarjetas con entusiasmo
        const p = cycle / 2; // 0→1
        const bob = Math.sin(t * 3.0) * 0.08;

        lerpBone(nodes, 'RightArm', 'x', -0.40 + bob, 0.08);
        lerpBone(nodes, 'RightArm', 'z', 0.70 + Math.sin(t * 2.0) * 0.05, 0.08);
        lerpBone(nodes, 'RightForeArm', 'x', -0.25 + bob * 0.8, 0.08);

        lerpBone(nodes, 'LeftArm', 'x', 0.10 + Math.sin(t * 1.8) * 0.08, 0.08);
        lerpBone(nodes, 'LeftArm', 'z', -0.15, 0.08);
        lerpBone(nodes, 'LeftForeArm', 'x', 0.05, 0.08);

        if (nodes.Head) {
          nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, -0.12, 0.05);
          nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, -0.30, 0.05);
        }

      } else if (cycle < 4) {
        // FASE 2: ambos brazos se abren como presentando "¡mira esto!"
        const wave = Math.sin(t * 2.5) * 0.10;

        lerpBone(nodes, 'RightArm', 'x', -0.55 + wave, 0.08);
        lerpBone(nodes, 'RightArm', 'z', 0.52, 0.08);
        lerpBone(nodes, 'RightForeArm', 'x', -0.20 + wave, 0.08);

        lerpBone(nodes, 'LeftArm', 'x', -0.55 + wave * 0.8, 0.08);
        lerpBone(nodes, 'LeftArm', 'z', -0.52, 0.08);
        lerpBone(nodes, 'LeftForeArm', 'x', -0.20 + wave * 0.8, 0.08);

        if (nodes.Head) {
          nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, -0.08 + Math.sin(t * 1.2) * 0.05, 0.05);
          nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, 0.00, 0.05);
        }

      } else {
        // FASE 3: brazo izquierdo "explica" mientras el derecho descansa
        const nod = Math.sin(t * 2.8) * 0.12;

        lerpBone(nodes, 'LeftArm', 'x', -0.60 + nod, 0.08);
        lerpBone(nodes, 'LeftArm', 'z', -0.40, 0.08);
        lerpBone(nodes, 'LeftForeArm', 'x', -0.30 + nod * 0.6, 0.08);

        lerpBone(nodes, 'RightArm', 'x', 0.05 + Math.sin(t * 1.5) * 0.06, 0.08);
        lerpBone(nodes, 'RightArm', 'z', 0.18, 0.08);
        lerpBone(nodes, 'RightForeArm', 'x', 0.03, 0.08);

        if (nodes.Head) {
          nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, -0.10 + Math.sin(t * 1.8) * 0.06, 0.05);
          nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, -0.15 + Math.sin(t * 0.8) * 0.08, 0.05);
        }
      }
    } else {
      // Idle: balanceo suave
      lerpBone(nodes, 'LeftArm', 'x', -0.15 + Math.sin(t * 2.0) * 0.12, 0.1);
      lerpBone(nodes, 'RightArm', 'x', -0.15 + Math.cos(t * 2.0) * 0.12, 0.1);
      lerpBone(nodes, 'LeftArm', 'z', -0.12 + Math.sin(t * 1.5) * 0.05, 0.1);
      lerpBone(nodes, 'RightArm', 'z', 0.12 + Math.cos(t * 1.5) * 0.05, 0.1);
      lerpBone(nodes, 'LeftForeArm', 'x', Math.sin(t * 2.2) * 0.08, 0.1);
      lerpBone(nodes, 'RightForeArm', 'x', Math.cos(t * 2.2) * 0.08, 0.1);
    }

    if (interactive && nodes.Hips && !isTour) {
      const targetX = (state.mouse.x * Math.PI) / 10;
      const targetY = (-state.mouse.y * Math.PI) / 14;
      nodes.Hips.rotation.y = THREE.MathUtils.lerp(nodes.Hips.rotation.y, targetX, 0.05);
      nodes.Hips.rotation.x = THREE.MathUtils.lerp(nodes.Hips.rotation.x, targetY, 0.05);
    }
  });

  if (!nodes.Hips || !nodes.char1 || !materials.Material_1) return null;

  return (
    <group ref={group} scale={1.15}>
      <group name="Scene">
        <group name="Armature" scale={0.01}>
          <primitive object={nodes.Hips} />
        </group>
        <skinnedMesh
          name="char1"
          geometry={nodes.char1.geometry}
          material={materials.Material_1}
          skeleton={nodes.char1.skeleton}
          scale={0.01}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  );
};

export default function EduBot3D({ className = "", interactive = true }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.15, 3.4], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2.2, 3.2, 2.8]} intensity={1.1} castShadow />
        <spotLight position={[-2, 3, 4]} angle={0.45} penumbra={1} intensity={0.8} />
        <Environment preset="city" />
        <RobotModel interactive={interactive} />
        <ContactShadows position={[0, -1.35, 0]} opacity={0.32} scale={3.2} blur={2.2} far={2.8} />
      </Canvas>
    </div>
  );
}

export function EduBot3DWithMode({ className = '', interactive = false, mode = 'idle', stepIndex = 0, pointDirection = 'right' }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.15, 3.4], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2.2, 3.2, 2.8]} intensity={1.1} castShadow />
        <spotLight position={[-2, 3, 4]} angle={0.45} penumbra={1} intensity={0.8} />
        <Environment preset="city" />
        <RobotModel interactive={interactive} mode={mode} stepIndex={stepIndex} pointDirection={pointDirection} />
        <ContactShadows position={[0, -1.35, 0]} opacity={0.32} scale={3.2} blur={2.2} far={2.8} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/LumiBot-transformed.glb');