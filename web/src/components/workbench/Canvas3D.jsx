import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function Canvas3D({ parts, wires, selected, onPick, onMove }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const reqIdRef = useRef(null);
  const meshesMapRef = useRef(new Map());
  const particleGroupRef = useRef(null);
  const cameraControlRef = useRef(null);
  const partsRef = useRef(parts);
  const onPickRef = useRef(onPick);
  const onMoveRef = useRef(onMove);

  useEffect(() => {
    partsRef.current = parts;
    onPickRef.current = onPick;
    onMoveRef.current = onMove;
  }, [parts, onPick, onMove]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1620);
    scene.fog = new THREE.FogExp2(0x0b1620, 0.009);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 60);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xeafcff, 1.35);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0x8be9fd, 0x142f24, 1.2);
    scene.add(hemisphereLight);

    const dirLight = new THREE.DirectionalLight(0x9ffcf0, 2.2);
    dirLight.position.set(20, 50, 30);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    backLight.position.set(-20, -30, -30);
    scene.add(backLight);

    const workLight = new THREE.PointLight(0x48e6d2, 18, 85, 2);
    workLight.position.set(0, 24, 8);
    scene.add(workLight);

    // 5. Grid PCB Ground plane
    const gridHelper = new THREE.GridHelper(90, 45, 0x315261, 0x182d38);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Ground plane mesh for shadow receiving
    const planeGeo = new THREE.PlaneGeometry(90, 90);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x10212b,
      roughness: 0.72,
      metalness: 0.28
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.6;
    plane.receiveShadow = true;
    scene.add(plane);

    // 6. Interactive Orbit & Pan state
    let isDragging = false;
    let draggedPartIndex = null;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = { theta: 0, phi: Math.PI / 3 };
    // A closer initial view keeps electronic components readable; wheel zoom
    // continues to change their apparent size with normal perspective.
    let cameraDistance = 50;

    const updateCameraPosition = () => {
      camera.position.x = cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
      camera.position.y = cameraDistance * Math.cos(cameraAngle.phi);
      camera.position.z = cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPosition();

    // Raycasting is shared by selecting and drag-moving components in the
    // rendered workspace.
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const pickPartIndex = e => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        let current = hit.object;
        while (current && current.parent && current.parent !== scene) {
          if (current.userData?.partIndex !== undefined) return current.userData.partIndex;
          current = current.parent;
        }
        if (current?.userData?.partIndex !== undefined) return current.userData.partIndex;
      }
      return null;
    };

    const onMouseDown = e => {
      const partIndex = pickPartIndex(e);
      if (partIndex !== null) {
        draggedPartIndex = partIndex;
        onPickRef.current?.(partIndex);
        e.preventDefault();
        return;
      }
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = e => {
      if (draggedPartIndex !== null) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const point = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(groundPlane, point)) {
          const x = Math.max(2, Math.min(98, (point.x / 35) * 50 + 50));
          const y = Math.max(2, Math.min(98, (point.z / 35) * 50 + 50));
          onMoveRef.current?.(draggedPartIndex, { x, y });
        }
        return;
      }
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraAngle.theta -= deltaX * 0.008;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraAngle.phi - deltaY * 0.008));

      updateCameraPosition();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      draggedPartIndex = null;
    };

    const changeZoom = delta => {
      // Exponential zoom feels responsive at every distance. There is no
      // maximum distance, so large circuits can be viewed as far out as needed.
      cameraDistance = Math.max(2, cameraDistance * Math.exp(delta * 0.0065));
      updateCameraPosition();
    };

    const onWheel = e => {
      e.preventDefault();
      e.stopPropagation();
      changeZoom(e.deltaY);
    };
    cameraControlRef.current = {
      zoomIn: () => changeZoom(-55),
      zoomOut: () => changeZoom(55)
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    const onClick = e => {
      const partIndex = pickPartIndex(e);
      if (partIndex !== null) onPickRef.current?.(partIndex);
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
    particleGroupRef.current = particleGroup;

    let time = 0;
    const animate = () => {
      time += 0.02;
      reqIdRef.current = requestAnimationFrame(animate);

      // Pulse selected component if exists
      meshesMapRef.current.forEach((mesh, idx) => {
        if (mesh.userData.isAcSource) {
          // AC sources remain stationary in the circuit but visibly hum with
          // their alternating waveform.
          mesh.position.y = Math.sin(time * 7) * 0.09;
          mesh.rotation.z = Math.sin(time * 7) * 0.025;
        } else if (idx === selected) {
          mesh.position.y = 1.0 + Math.sin(time * 3) * 0.2;
        } else {
          mesh.position.y = 0;
        }

        if (mesh.userData.stepperRotor) {
          // Discrete angle increments make a stepper look mechanically
          // stepped instead of like a continuously spinning DC motor.
          mesh.userData.stepperRotor.rotation.y = Math.floor(time * 12) * (Math.PI / 12);
        }
      });

      // Animate current flow particles
      const particles = particleGroup.children;
      particles.forEach((p, idx) => {
        if (p.userData && p.userData.curve) {
          const progress = (time * 0.28 + p.userData.offset) % 1;
          const t = p.userData.motion === "ac"
            ? 0.5 + Math.sin(time * 3.8 + p.userData.offset * Math.PI * 2) * 0.44
            : p.userData.direction === -1 ? 1 - progress : progress;
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
      particleGroupRef.current = null;
      cameraControlRef.current = null;
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

    const particleGroup = particleGroupRef.current;
    if (particleGroup) {
      while (particleGroup.children.length) {
        const particle = particleGroup.children.pop();
        particle.geometry?.dispose();
        particle.material?.dispose();
      }
    }

    // Map 2D percentage coords [0..100] to 3D coords [-35..35]
    const mapCoords = (x, y) => ({
      x: ((x - 50) / 50) * 35,
      z: ((y - 50) / 50) * 35
    });
    const sourceProfile = part => {
      const type = part.type.toLowerCase();
      if (type.includes("power supply")) return { height: 7.4, terminalSpread: 1.2 };
      if (type.includes("ac source")) return { height: 4.8, terminalSpread: 0.82 };
      return { height: 3.35, terminalSpread: 0.58 }; // Battery: compact by design.
    };

    // Build 3D models for each part
    parts.forEach((part, index) => {
      const pos = mapCoords(part.x, part.y);
      const isSelected = selected === index;
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);
      group.userData = {
        isComponent: true,
        partIndex: index,
        isAcSource: part.type.toLowerCase().includes("ac source")
      };

      // Orient every component along its first graph edge. Because this scene
      // is rebuilt when parts or wires change, orientation follows rewiring
      // and drag-repositioning automatically.
      const connectedWire = wires.find(w => w.from === index || w.to === index);
      if (connectedWire) {
        const otherIndex = connectedWire.from === index ? connectedWire.to : connectedWire.from;
        const other = parts[otherIndex];
        if (other) {
          const otherPos = mapCoords(other.x, other.y);
          const dx = otherPos.x - pos.x;
          const dz = otherPos.z - pos.z;
          group.rotation.y = Math.atan2(dx, dz);
        }
      }

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

        // Replace the placeholder with the downloaded GLB. Each resistor gets
        // its own scene instance and is normalized to a consistent 7-unit
        // engineering footprint, regardless of the source model's units.
        const loader = new GLTFLoader();
        loader.load(
          `${import.meta.env.BASE_URL}models/10k_ohm_resistor.glb`,
          (gltf) => {
            if (!group.parent) return;
            const model = gltf.scene;
            model.rotation.y = Math.PI / 2;
            const bounds = new THREE.Box3().setFromObject(model);
            const size = bounds.getSize(new THREE.Vector3());
            const longestSide = Math.max(size.x, size.y, size.z, 0.001);
            const normalizedScale = 4.2 / longestSide;
            model.scale.setScalar(normalizedScale);

            const normalizedBounds = new THREE.Box3().setFromObject(model);
            const center = normalizedBounds.getCenter(new THREE.Vector3());
            model.position.set(-center.x, 1.2 - normalizedBounds.min.y, -center.z);
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            body.visible = false;
            leads.visible = false;
            group.add(model);
          },
          undefined,
          () => {
            // Keep the generated resistor visible if the model is unavailable.
          }
        );
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
      } else if (type.includes("battery") || type.includes("source") || type.includes("power supply")) {
        // The supplied battery asset represents both the Battery library item
        // and existing AC Source / voltage-source parts in saved presets.
        // Both have two visible top terminals for physical wire anchors.
        const profile = sourceProfile(part);
        const footprint = profile.height * 0.58;
        const fallbackGeo = new THREE.BoxGeometry(footprint, profile.height, footprint * 0.62);
        const fallbackMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0x28475a,
          roughness: 0.38,
          metalness: 0.5
        });
        const fallback = new THREE.Mesh(fallbackGeo, fallbackMat);
        fallback.position.y = profile.height / 2;
        group.add(fallback);

        const positiveTerminalMat = new THREE.MeshStandardMaterial({
          color: 0xff5555,
          emissive: 0x8f0000,
          emissiveIntensity: 1.2,
          metalness: 0.82,
          roughness: 0.2
        });
        const negativeTerminalMat = new THREE.MeshStandardMaterial({
          color: 0x253749,
          emissive: 0x06101c,
          emissiveIntensity: 0.8,
          metalness: 0.9,
          roughness: 0.18
        });
        // Terminal zero is the positive (+) terminal: DC particles leave here
        // and return through terminal one (−), using conventional-current direction.
        [-profile.terminalSpread, profile.terminalSpread].forEach((x, terminalIndex) => {
          const terminal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.32, 0.42, 16),
            terminalIndex === 0 ? positiveTerminalMat : negativeTerminalMat
          );
          terminal.position.set(x, profile.height + 0.12, 0);
          terminal.userData = { batteryTerminal: terminalIndex, polarity: terminalIndex === 0 ? "+" : "−" };
          group.add(terminal);

          const markerMat = terminalIndex === 0 ? positiveTerminalMat : negativeTerminalMat;
          const horizontal = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.09), markerMat);
          horizontal.position.set(x, profile.height + 0.38, 0);
          group.add(horizontal);
          if (terminalIndex === 0) {
            const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.52), markerMat);
            vertical.position.set(x, profile.height + 0.38, 0);
            group.add(vertical);
          }
        });

        const loader = new GLTFLoader();
        loader.load(
          `${import.meta.env.BASE_URL}models/battery.glb`,
          (gltf) => {
            if (!group.parent) return;
            const model = gltf.scene;
            const bounds = new THREE.Box3().setFromObject(model);
            const size = bounds.getSize(new THREE.Vector3());
            const height = Math.max(size.y, 0.001);
            model.scale.setScalar(profile.height / height);
            const normalizedBounds = new THREE.Box3().setFromObject(model);
            const center = normalizedBounds.getCenter(new THREE.Vector3());
            model.position.set(-center.x, 0.08 - normalizedBounds.min.y, -center.z);
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            fallback.visible = false;
            group.add(model);
          },
          undefined,
          () => {
            // The terminalled fallback keeps the circuit usable if the asset fails to load.
          }
        );
      } else if (type.includes("motor")) {
        const isStepperMotor = type.includes("stepper");
        // Steppers have a squat, high-torque body; other motors retain the
        // longer industrial chassis.
        const motorGeo = new THREE.CylinderGeometry(isStepperMotor ? 2.65 : 2.35, isStepperMotor ? 2.65 : 2.35, isStepperMotor ? 4.1 : 5.8, 24);
        const motorMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x48e6d2 : 0x334155,
          metalness: 0.6,
          roughness: 0.4
        });
        const motor = new THREE.Mesh(motorGeo, motorMat);
        motor.position.y = isStepperMotor ? 2.05 : 2.9;
        group.add(motor);

        // Rotating shaft / rotor. Steppers additionally expose a toothed rotor
        // that advances in clear incremental turns in the animation loop.
        const rotor = new THREE.Group();
        const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, isStepperMotor ? 5.8 : 7, 12);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.y = isStepperMotor ? 3.0 : 3.5;
        rotor.add(shaft);
        if (isStepperMotor) {
          const rotorDisc = new THREE.Mesh(
            new THREE.CylinderGeometry(1.15, 1.15, 0.38, 24),
            new THREE.MeshStandardMaterial({ color: 0xffc653, emissive: 0x5c3200, emissiveIntensity: 0.7, metalness: 0.75 })
          );
          rotorDisc.position.y = 3.8;
          rotor.add(rotorDisc);
          group.userData.stepperRotor = rotor;

          // Replace the placeholder chassis with the supplied, real stepper
          // model. The procedural rotor remains as a dependable animated shaft
          // when a downloaded model does not expose a separately named rotor.
          const loader = new GLTFLoader();
          loader.load(
            `${import.meta.env.BASE_URL}models/electronic_stepper_motor.glb`,
            (gltf) => {
              if (!group.parent) return;
              const model = gltf.scene;
              const bounds = new THREE.Box3().setFromObject(model);
              const size = bounds.getSize(new THREE.Vector3());
              const longestSide = Math.max(size.x, size.y, size.z, 0.001);
              model.scale.setScalar(6.6 / longestSide);
              const normalizedBounds = new THREE.Box3().setFromObject(model);
              const center = normalizedBounds.getCenter(new THREE.Vector3());
              model.position.set(-center.x, 0.08 - normalizedBounds.min.y, -center.z);
              model.traverse(child => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              motor.visible = false;
              group.add(model);
            },
            undefined,
            () => {
              // Retain the procedural stepper if the optional GLB is unavailable.
            }
          );
        }
        group.add(rotor);
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

    // Work out source types and the connected circuit topology.
    const isBatteryLike = part => {
      const type = part.type.toLowerCase();
      return type.includes("battery") || type.includes("source") || type.includes("power supply");
    };
    const dcSourceIndex = parts.findIndex(part => {
      const type = part.type.toLowerCase();
      return type.includes("battery") || type.includes("power supply");
    });
    const acSourceIndex = parts.findIndex(part => part.type.toLowerCase().includes("ac source"));
    // Use the DC supply when present; otherwise use the AC source only to
    // discover its connected network for alternating-current animation.
    const batteryIndex = dcSourceIndex !== -1 ? dcSourceIndex : acSourceIndex;
    const electricalDistance = new Map();
    if (batteryIndex !== -1) {
      electricalDistance.set(batteryIndex, 0);
      const pending = [batteryIndex];
      while (pending.length) {
        const node = pending.shift();
        wires.forEach(link => {
          const neighbor = link.from === node ? link.to : link.to === node ? link.from : null;
          if (neighbor !== null && !electricalDistance.has(neighbor)) {
            electricalDistance.set(neighbor, electricalDistance.get(node) + 1);
            pending.push(neighbor);
          }
        });
      }
    }

    const connectionPoint = (partIndex, otherIndex, wire) => {
      const part = parts[partIndex];
      const mapped = mapCoords(part.x, part.y);
      if (!isBatteryLike(part)) {
        return new THREE.Vector3(mapped.x, 1.2, mapped.z);
      }

      const links = wires.filter(link => link.from === partIndex || link.to === partIndex);
      const terminal = Math.max(0, links.indexOf(wire)) % 2;
      const batteryMesh = meshesMapRef.current.get(partIndex);
      const profile = sourceProfile(part);
      const terminalPoint = new THREE.Vector3(
        terminal === 0 ? -profile.terminalSpread : profile.terminalSpread,
        profile.height + 0.34,
        0
      );
      if (batteryMesh) return batteryMesh.localToWorld(terminalPoint);
      return new THREE.Vector3(
        mapped.x + (terminal === 0 ? -profile.terminalSpread : profile.terminalSpread),
        profile.height + 0.34,
        mapped.z
      );
    };

    const terminalForWire = (sourceIndex, wire) => {
      const links = wires.filter(link => link.from === sourceIndex || link.to === sourceIndex);
      return Math.max(0, links.indexOf(wire)) % 2;
    };

    // For DC, derive a single directed circuit loop: source + terminal →
    // components → source − terminal. This avoids the misleading "away from
    // source" distance heuristic that can reverse a component's wire in a loop.
    const dcFlowDirections = new Map();
    if (dcSourceIndex !== -1) {
      const sourceWireIndexes = wires
        .map((wire, index) => ({ wire, index }))
        .filter(({ wire }) => wire.from === dcSourceIndex || wire.to === dcSourceIndex)
        .map(({ index }) => index);
      const positiveWireIndex = sourceWireIndexes[0];
      const negativeWireIndex = sourceWireIndexes[1];

      if (positiveWireIndex !== undefined) {
        const positiveWire = wires[positiveWireIndex];
        const firstNode = positiveWire.from === dcSourceIndex ? positiveWire.to : positiveWire.from;
        dcFlowDirections.set(positiveWireIndex, positiveWire.from === dcSourceIndex ? 1 : -1);

        if (negativeWireIndex !== undefined) {
          const negativeWire = wires[negativeWireIndex];
          const lastNode = negativeWire.from === dcSourceIndex ? negativeWire.to : negativeWire.from;
          const adjacency = new Map();
          wires.forEach((wire, index) => {
            if (index === positiveWireIndex || index === negativeWireIndex) return;
            if (wire.from === dcSourceIndex || wire.to === dcSourceIndex) return;
            if (!adjacency.has(wire.from)) adjacency.set(wire.from, []);
            if (!adjacency.has(wire.to)) adjacency.set(wire.to, []);
            adjacency.get(wire.from).push({ node: wire.to, index });
            adjacency.get(wire.to).push({ node: wire.from, index });
          });

          const previous = new Map();
          const pending = [firstNode];
          previous.set(firstNode, null);
          while (pending.length && !previous.has(lastNode)) {
            const node = pending.shift();
            (adjacency.get(node) || []).forEach(next => {
              if (!previous.has(next.node)) {
                previous.set(next.node, { from: node, wireIndex: next.index });
                pending.push(next.node);
              }
            });
          }

          if (previous.has(lastNode)) {
            let cursor = lastNode;
            while (cursor !== firstNode) {
              const step = previous.get(cursor);
              const wire = wires[step.wireIndex];
              dcFlowDirections.set(step.wireIndex, wire.from === step.from ? 1 : -1);
              cursor = step.from;
            }
            // The final edge must enter the negative terminal.
            dcFlowDirections.set(negativeWireIndex, negativeWire.to === dcSourceIndex ? 1 : -1);
          }
        }
      }
    }

    // Build 3D Wires and battery-powered current-flow paths.
    wires.forEach((w, wireIndex) => {
      const a = parts[w.from];
      const b = parts[w.to];
      if (!a || !b) return;

      const startVec = connectionPoint(w.from, w.to, w);
      const endVec = connectionPoint(w.to, w.from, w);
      const midVec = new THREE.Vector3(
        (startVec.x + endVec.x) / 2,
        Math.max(startVec.y, endVec.y) + 2.8,
        (startVec.z + endVec.z) / 2
      );

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.15, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xffbe32,
        emissive: 0x7d4900,
        emissiveIntensity: 1.15,
        roughness: 0.3,
        metalness: 0.8
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.userData = { isWire: true };
      scene.add(tube);

      const fromDistance = electricalDistance.get(w.from) ?? 0;
      const toDistance = electricalDistance.get(w.to) ?? 0;
      const outwardDirection = dcFlowDirections.get(wireIndex) ?? (fromDistance <= toDistance ? 1 : -1);
      const hasAcSource = acSourceIndex !== -1
        && electricalDistance.has(w.from)
        && electricalDistance.has(w.to);

      // DC charge moves one way with conventional polarity. AC charge
      // oscillates back and forth rather than pretending to be DC flow.
      const particleCount = hasAcSource ? 3 : 1;
      for (let i = 0; i < particleCount; i++) {
        const pGeo = new THREE.SphereGeometry(0.34, 12, 12);
        const pMat = new THREE.MeshStandardMaterial({
          color: 0xffe17a,
          emissive: 0xffa800,
          emissiveIntensity: 3.2,
          roughness: 0.2
        });
        const particle = new THREE.Mesh(pGeo, pMat);
        particle.userData = {
          isParticle: true,
          curve,
          motion: hasAcSource ? "ac" : "dc",
          direction: outwardDirection,
          offset: i / particleCount
        };
        particleGroup?.add(particle);
      }
    });
  }, [parts, wires, selected]);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] bg-[#070B11] border border-[#1D2B35] overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-3 left-3 flex border border-[#1D2B35] bg-[#0D141C]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={() => cameraControlRef.current?.zoomIn()}
          className="px-3 py-1.5 text-sm font-mono text-[#E6EDF3] hover:bg-[#16313a] hover:text-[#48E6D2] border-r border-[#1D2B35]"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => cameraControlRef.current?.zoomOut()}
          className="px-3 py-1.5 text-sm font-mono text-[#E6EDF3] hover:bg-[#16313a] hover:text-[#48E6D2]"
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* 3D Viewport Controls & Instructions */}
      <div className="absolute top-3 right-3 bg-[#0D141C]/80 backdrop-blur-md border border-[#1D2B35] px-3 py-1.5 text-[10px] font-mono text-[#8A98A6] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#48E6D2] animate-pulse"></span>
        <span>THREE.JS 3D ACCELERATED</span>
      </div>

      <div className="absolute bottom-3 left-3 bg-[#0D141C]/80 backdrop-blur-md border border-[#1D2B35] px-3 py-1.5 text-[10px] font-mono text-[#8A98A6] flex items-center gap-2 pointer-events-none">
        <span>DRAG COMPONENT TO MOVE • DRAG EMPTY SPACE TO ORBIT • WHEEL TO ZOOM</span>
      </div>
    </div>
  );
}
