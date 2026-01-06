import { useEffect, useRef } from "react";
import * as THREE from "three";

import crispImg from "./assets/crisp.jpg";
import juniperImg from "./assets/juniper.jpg";
import puddleImg from "./assets/puddle.jpg";

const RollingSpheres = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfa8072); // salmon

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 15;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const textureLoader = new THREE.TextureLoader();

    const textures = [
      textureLoader.load(crispImg),
      textureLoader.load(juniperImg),
      textureLoader.load(puddleImg),
    ];

    // Smaller spheres
    const radius = 0.8;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);

    const spheres: THREE.Mesh[] = [];

    textures.forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0.2,
      });

      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      spheres.push(sphere);
    });
    
    // Initial positions and velocities for bouncing
    const velocities: THREE.Vector3[] = [
      new THREE.Vector3(0.06, 0.04, 0),
      new THREE.Vector3(-0.05, 0.07, 0),
      new THREE.Vector3(0.04, -0.05, 0),
    ];

    spheres.forEach((sphere, index) => {
      // Spread them out initially
      sphere.position.set((index - 1) * 2.5, (index % 2) * 1.5, 0);
    });

    let halfWidthWorld: number;
    let halfHeightWorld: number;

    const updateWorldBounds = () => {
      const distance = Math.abs(camera.position.z); // distance from camera to z=0 plane
      halfHeightWorld = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      halfWidthWorld = halfHeightWorld * camera.aspect;
    };

    updateWorldBounds();

    const onResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      updateWorldBounds();
    };

    window.addEventListener("resize", onResize);

    const animate = () => {
      spheres.forEach((sphere, index) => {
        const v = velocities[index];

        sphere.position.x += v.x;
        sphere.position.y += v.y;

        // Bounce horizontally
        const maxX = halfWidthWorld - radius;
        if (sphere.position.x > maxX || sphere.position.x < -maxX) {
          v.x *= -1;
          sphere.position.x = THREE.MathUtils.clamp(sphere.position.x, -maxX, maxX);
        }

        // Bounce vertically
        const maxY = halfHeightWorld - radius;
        if (sphere.position.y > maxY || sphere.position.y < -maxY) {
          v.y *= -1;
          sphere.position.y = THREE.MathUtils.clamp(sphere.position.y, -maxY, maxY);
        }

        sphere.rotation.x += 0.02;
        sphere.rotation.y += 0.025;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      spheres.forEach((s) => {
        (s.material as THREE.Material).dispose();
        s.geometry.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="rolling-spheres-container" />;
};

export default RollingSpheres;
