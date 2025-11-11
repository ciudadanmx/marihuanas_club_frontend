import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * PointsSmoke - versión más liviana usando Points + PointsMaterial
 * - Crea muchas partículas (puntos) y las anima con ruido-approach simple.
 * - Ideal para dispositivos con menos GPU o para cuando necesites rendimiento.
 */

export default function PointsSmoke() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000);
    camera.position.z = 180;

    // lights for a few meshes
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff5cc, 0.5);
    dir.position.set(50, 40, 80);
    scene.add(dir);

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 300; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 180; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // z
      sizes[i] = 6 + Math.random() * 12;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 12,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      map: null, // si tienes una textura pequeña circular la pones aquí (ej: smoke particle)
      alphaTest: 0.01
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // animación sencilla (ascenso y oscilación)
    let rafId;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // subir lentamente
        pos[idx + 1] += 0.03 + ((i % 10) * 0.001);
        // oscilación x / z con seno
        pos[idx + 0] += Math.sin(t * 0.2 + i) * 0.002;
        pos[idx + 2] += Math.cos(t * 0.17 + i * 0.5) * 0.002;
        // resetear si sale
        if (pos[idx + 1] > 140) pos[idx + 1] = -120 - Math.random() * 30;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
