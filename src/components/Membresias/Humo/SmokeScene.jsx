import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * SmokeScene
 * - Crea varios planos con ShaderMaterial que usan ruido procedural para animar el alpha/offset.
 * - Añade además algunos meshes con MeshStandardMaterial para que reaccionen a las luces.
 *
 * NOTAS:
 * - Si quieres usar una textura de humo (sprite), descomenta el loader y pásala a la uniform uSmoke.
 * - El shader usa una función de ruido simple (iq-style) para evitar dependencias.
 */

export default function SmokeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 0, 160);

    // Lights: ambient, hemisphere, directional y puntos para dramatismo
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xaaaaee, 0x222222, 0.35);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff5cc, 0.6);
    dir.position.set(-100, 80, 120);
    scene.add(dir);

    const p1 = new THREE.PointLight(0xffa060, 0.8, 500, 2);
    p1.position.set(80, -30, 100);
    scene.add(p1);

    const p2 = new THREE.PointLight(0x80aaff, 0.45, 400, 2);
    p2.position.set(-80, 60, 60);
    scene.add(p2);

    // Opcional: cargar textura de smoke (comentado)
    // const loader = new THREE.TextureLoader();
    // const smokeTex = loader.load("/smoke.png");
    // smokeTex.wrapS = smokeTex.wrapT = THREE.RepeatWrapping;

    // --- SHADER: ruido simple (iq) + desplazamiento de uv por tiempo ---
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPos;
      void main(){
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // función de ruido (iq's) - 2D
    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform sampler2D uSmoke; // opcional si quieres textura
      uniform float uUseTexture;
      varying vec2 vUv;
      varying vec3 vPos;

      // iq-style hash / noise
      float hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
        return -1.0 + 2.0 * fract(sin(p.x+p.y) * 43758.5453123);
      }

      float noise(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        // four corners
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // fbm
      float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        for (int i = 0; i < 5; i++) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main(){
        // coords
        vec2 uv = vUv;
        vec2 pos = (uv - 0.5) * vec2(2.0, 1.6); // alargar verticalmente
        // movimiento por tiempo
        float t = uTime * 0.08;
        // fbm como base del humo
        float n = fbm(pos * 1.5 + vec2(0.0, t * 1.2));
        // detalle fino
        float detail = fbm(pos * 6.0 - vec2(t * 1.6, t * 0.7)) * 0.5;
        float density = smoothstep(0.25, 0.75, n + detail * 0.5);
        // crear vetas y roll
        float streaks = smoothstep(0.3, 0.9, fbm(pos * vec2(8.0, 2.0) + vec2(t * 0.5, 0.0)));
        // combinar
        float alpha = density *  (0.6 + 0.4 * streaks);
        // color base y matices
        vec3 base = vec3(0.95, 0.95, 0.96); // casi blanco humo claro
        vec3 tint = mix(base, vec3(1.0, 0.9, 0.7), pos.y*0.2 + 0.1); // un poquito cálido abajo
        // si tienes textura de smoke, multiplícala para tener forma más orgánica
        if (uUseTexture > 0.5) {
          vec4 s = texture2D(uSmoke, uv);
          float texAlpha = s.a;
          alpha *= texAlpha;
        }
        // salida
        gl_FragColor = vec4(tint, alpha);
        // recortar para evitar demasiado opaco
        if (gl_FragColor.a < 0.02) discard;
      }
    `;

    // Uniforms
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uSmoke: { value: null }, // asigna una textura si la quieres
      uUseTexture: { value: 0.0 }
    };

    // Material shader compartido
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });

    // Crear varios planos (capas) con el shader
    const planes = [];
    const planeGeo = new THREE.PlaneGeometry(160, 120);
    for (let i = 0; i < 30; i++) {
      const m = shaderMaterial.clone();
      // variar parámetros por instancia si quieres (no tenemos uniformes por instancia aquí)
      const mesh = new THREE.Mesh(planeGeo, m);
      mesh.position.x = (Math.random() - 0.5) * 60;
      mesh.position.y = (Math.random() - 0.5) * 80 - 10;
      mesh.position.z = (Math.random() - 0.5) * 220;
      const s = 0.8 + Math.random() * 1.6;
      mesh.scale.set(s, s, s);
      mesh.rotation.z = Math.random() * Math.PI * 2;
      scene.add(mesh);
      planes.push(mesh);
    }

    // Añadimos un par de meshes con MeshStandardMaterial para interacción con la luz
    const geoBall = new THREE.SphereGeometry(8, 32, 24);
    const matBall = new THREE.MeshStandardMaterial({ color: 0xffe0a0, metalness: 0.1, roughness: 0.6 });
    const ball = new THREE.Mesh(geoBall, matBall);
    ball.position.set(0, -30, 20);
    scene.add(ball);

    const geoTorus = new THREE.TorusKnotGeometry(10, 3.2, 120, 16);
    const matTorus = new THREE.MeshStandardMaterial({ color: 0x90c0ff, metalness: 0.2, roughness: 0.5 });
    const torus = new THREE.Mesh(geoTorus, matTorus);
    torus.position.set(-30, 20, 40);
    scene.add(torus);

    // Animación
    let rafId;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      // actualizar uniform tiempo del shader
      scene.traverse((obj) => {
        if (obj.material && obj.material.uniforms && obj.material.uniforms.uTime) {
          obj.material.uniforms.uTime.value = t;
        }
      });

      // mover capas suavemente para dar sensación de ascenso
      planes.forEach((p, i) => {
        p.rotation.z += 0.0008 + i * 0.0004;
        p.position.y += 0.02 + (i % 5) * 0.002;
        if (p.position.y > 120) p.position.y = -100 - Math.random() * 20;
      });

      // animaciones decorativas de meshes standard
      ball.rotation.y += 0.005;
      torus.rotation.x += 0.003;
      torus.rotation.y += 0.004;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // actualizar uniform resolución
      scene.traverse((obj) => {
        if (obj.material && obj.material.uniforms && obj.material.uniforms.uResolution) {
          obj.material.uniforms.uResolution.value.set(w, h);
        }
      });
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      // liberar geometrías y materiales
      planeGeo.dispose();
      geoBall.dispose();
      geoTorus.dispose();
      matBall.dispose();
      matTorus.dispose();
      planes.forEach((p) => {
        if (p.material) {
          p.material.dispose();
        }
        if (p.geometry) p.geometry.dispose();
        scene.remove(p);
      });
      // dispose scene lights
      scene.traverse((o) => {
        if (o.isLight) {
          // nothing special
        }
      });
      renderer.forceContextLoss();
      renderer.dispose();
      if (renderer.domElement) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
