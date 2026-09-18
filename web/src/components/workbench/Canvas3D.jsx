import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Canvas3D({ parts, wires, selected, onPick }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const reqIdRef = useRef(null);
  const meshesMapRef = useRef(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b11);
    scene.fog = new THREE.FogExp2(0x070b11, 0.015);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 60);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x48e6d2, 1.2);
    dirLight.position.set(20, 50, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    backLight.position.set(-20, -30, -30);
    scene.add(backLight);

    // 5. Grid PCB Ground plane
    const gridHelper = new THREE.GridHelper(90, 45, 0x1d2b35, 0x111a23);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Ground plane mesh for shadow receiving
    const planeGeo = new THREE.PlaneGeometry(90, 90);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x0a1017,
      roughness: 0.8,
      metalness: 0.2
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.6;
    plane.receiveShadow = true;
    scene.add(plane);

    // 6. Interactive Orbit & Pan state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = { theta: 0, phi: Math.PI / 3 };
    let cameraDistance = 70;

    const updateCameraPosition = () => {
      camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
      camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
      camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPosition();

    const onMouseDown = e => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = e => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraAngle.theta -= deltaX * 0.008;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraAngle.phi - deltaY * 0.008));

      updateCameraPosition();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = e => {
      e.preventDefault();
      cameraDistance = Math.max(25, Math.min(120, cameraDistance + e.deltaY * 0.05));
      updateCameraPosition();
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // Click Raycaster for picking components
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = e => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        let current = hit.object;
        while (current && current.parent && current.parent !== scene) {
          if (current.userData && current.userData.partIndex !== undefined) {
            onPick(current.userData.partIndex);
            return;
          }
          current = current.parent;
        }
        if (current && current.userData && current.userData.partIndex !== undefined) {
          onPick(current.userData.partIndex);
          return;
        }
      }
    };
    dom.addEventListener("click", onClick);

    // Window Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Particle charges along wires
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    let time = 0;
    const animate = () => {
      time += 0.02;
      reqIdRef.current = requestAnimationFrame(animate);

      // Pulse selected component if exists
      meshesMapRef.current.forEach((mesh, idx) => {
        if (idx === selected) {
          mesh.position.y = 1.0 + Math.sin(time * 3) * 0.2;
        } else {
          mesh.position.y = 0;
        }
      });

      // Animate current flow particles
      const particles = particleGroup.children;
      particles.forEach((p, idx) => {
        if (p.userData && p.userData.curve) {
          const t = (time * 0.4 + idx * 0.15) % 1;
          const pos = p.userData.curve.getPoint(t);
          p.position.copy(pos);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("mousedown", onMouseDown);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("click", onClick);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
    };
  }, []);

  // Update 3D Meshes when parts or wires change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old component and wire meshes
    meshesMapRef.current.forEach(mesh => scene.remove(mesh));
    meshesMapRef.current.clear();

    const oldObjects = scene.children.filter(c => c.userData && (c.userData.isComponent || c.userData.isWire || c.userData.isParticle));
    oldObjects.forEach(obj => scene.remove(obj));

    // Map 2D percentage coords [0..100] to 3D coords [-35..35]
    const mapCoords = (x, y) => ({
      x: ((x - 50) / 50) * 35,
      z: ((y - 50) / 50) * 35
    });

    // Build 3D models for each part
    parts.forEach((part, index) => {
      const pos = mapCoords(part.x, part.y);
      const isSelected = selected === index;
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);
      group.userData = { isComponent: true, partIndex: index };

      const type = part.type.toLowerCase();

      if (type.includes("resistor")) {
        // Resistor body + color rings
        const bodyGeo = new THREE.CylinderGeometry(0.9, 0.9, 4, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0xd8c29d,
          roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 1.2;
        group.add(body);

        // Terminal leads
        const leadGeo = new THREE.CylinderGeometry(0.15, 0.15, 7, 8);
        const leadMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
        const leads = new THREE.Mesh(leadGeo, leadMat);
        leads.rotation.z = Math.PI / 2;
        leads.position.y = 1.2;
        group.add(leads);
      } else if (type.includes("capacitor")) {
        // Electrolytic cylinder
        const capGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.5, 20);
        const capMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0x1e3a8a,
          roughness: 0.2,
          metalness: 0.5
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 1.75;
        group.add(cap);

        // Metal top plate
        const topGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 20);
        const topMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 3.5;
        group.add(top);
      } else if (type.includes("inductor")) {
        // Toroid / Coil
        const coilGeo = new THREE.TorusGeometry(1.4, 0.5, 12, 32);
        const coilMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0xb45309,
          metalness: 0.8,
          roughness: 0.3
        });
        const coil = new THREE.Mesh(coilGeo, coilMat);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = 1.4;
        group.add(coil);
      } else if (type.includes("motor")) {
        // Industrial DC / AC motor chassis
        const motorGeo = new THREE.CylinderGeometry(2, 2, 5, 24);
        const motorMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0x334155,
          metalness: 0.6,
          roughness: 0.4
        });
        const motor = new THREE.Mesh(motorGeo, motorMat);
        motor.position.y = 2.5;
        group.add(motor);

        // Rotating shaft
        const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 7, 12);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.y = 3.5;
        group.add(shaft);
      } else if (type.includes("ic") || type.includes("op-amp")) {
        // DIP IC package
        const icGeo = new THREE.BoxGeometry(4, 1.2, 2.5);
        const icMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0x111827,
          roughness: 0.5
        });
        const ic = new THREE.Mesh(icGeo, icMat);
        ic.position.y = 0.8;
        group.add(ic);
      } else {
        // Generic engineering modular block
        const blockGeo = new THREE.BoxGeometry(2.5, 2.0, 2.5);
        const blockMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0x1e293b,
          roughness: 0.4,
          metalness: 0.3
        });
        const block = new THREE.Mesh(blockGeo, blockMat);
        block.position.y = 1.0;
        group.add(block);
      }

      // Base Pin highlight
      const pinGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x48e6d2 : 0x1d2b35,
        transparent: true,
        opacity: 0.6
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.y = 0.05;
      group.add(pin);

      scene.add(group);
      meshesMapRef.current.set(index, group);
    });

    // Build 3D Wires and Current Flow Paths
    wires.forEach(w => {
      const a = parts[w.from];
      const b = parts[w.to];
      if (!a || !b) return;

      const pA = mapCoords(a.x, a.y);
      const pB = mapCoords(b.x, b.y);

      const startVec = new THREE.Vector3(pA.x, 1.2, pA.z);
      const endVec = new THREE.Vector3(pB.x, 1.2, pB.z);
      const midVec = new THREE.Vector3((pA.x + pB.x) / 2, 4.0, (pA.z + pB.z) / 2);

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.15, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x48e6d2,
        emissive: 0x104b46,
        roughness: 0.3,
        metalness: 0.8
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.userData = { isWire: true };
      scene.add(tube);

      // Create glowing charge particles
      for (let i = 0; i < 2; i++) {
        const pGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x48e6d2 });
        const particle = new THREE.Mesh(pGeo, pMat);
        particle.userData = { isParticle: true, curve: curve };
        scene.add(particle);
      }
    });
  }, [parts, wires, selected]);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] bg-[#070B11] border border-[#1D2B35] overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Viewport Controls & Instructions */}
      <div className="absolute top-3 right-3 bg-[#0D141C]/80 backdrop-blur-md border border-[#1D2B35] px-3 py-1.5 text-[10px] font-mono text-[#8A98A6] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#48E6D2] animate-pulse"></span>
        <span>THREE.JS 3D ACCELERATED</span>
      </div>

      <div className="absolute bottom-3 left-3 bg-[#0D141C]/80 backdrop-blur-md border border-[#1D2B35] px-3 py-1.5 text-[10px] font-mono text-[#8A98A6] flex items-center gap-2 pointer-events-none">
        <span>LEFT-DRAG TO ORBIT • WHEEL TO ZOOM • CLICK COMPONENT TO SELECT</span>
      </div>
    </div>
  );
}
