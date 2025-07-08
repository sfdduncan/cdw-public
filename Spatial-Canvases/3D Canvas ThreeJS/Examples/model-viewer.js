// model-viewer.js
// Three.js scene to load and display a 3D model with OrbitControls

(function() {
  // Scene, camera, renderer setup
  const scene = new THREE.Scene();
  // Make the renderer fullscreen
  const container = document.getElementById('threejs-container-4');
  const width = window.innerWidth;
  const height = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0xf0f0f0);
  container.appendChild(renderer.domElement);

  // Handle resizing
  window.addEventListener('resize', function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  // No grid helper (removed)

  // Add ambient and directional light
  const ambient = new THREE.AmbientLight(0xffffff, 0.7); // softer ambient
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7); // softer directional
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);
  // Add a point light at the camera for extra bubble highlights
  const camLight = new THREE.PointLight(0xffffff, 1.2, 100);
  camera.add(camLight);
  scene.add(camera);

  // Camera position
  camera.position.set(0, 8, 8);
  camera.lookAt(0, 0, 0);

  // OrbitControls - restrict to horizontal rotation (azimuth) only (no zoom, no pan)
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.screenSpacePanning = false;
  controls.minDistance = 8; // lock zoom
  controls.maxDistance = 8; // lock zoom
  controls.target.set(0, 1, 0);
  // Restrict polar angle so you can't tilt up/down (only spin horizontally)
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  // Add floating bubble spheres
  const bubbles = [];
  const bubbleCount = 80;
  for (let i = 0; i < bubbleCount; i++) {
    // Bubbles: visible, 3D, but not too opaque
    const size = 1 + Math.random() * 1.7;
    const bubbleGeom = new THREE.SphereGeometry(size, 64, 64);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x99ccff,
      transparent: true,
      opacity: 0.85 + Math.random() * 0.1, // much more opaque
      roughness: 0.01 + Math.random() * 0.02,
      metalness: 0.0,
      transmission: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01 + Math.random() * 0.02,
      ior: 1.45 + Math.random() * 0.1,
      reflectivity: 1.0,
      thickness: 0.2 + Math.random() * 0.2,
      attenuationColor: 0x99ccff,
      attenuationDistance: 1.0 + Math.random() * 0.5
    });
    const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
    // Place bubbles in a sphere around the origin, full 3D (front and back)
    // Move bubbles slightly forward so they are in front of the model
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI;
    const radius = 3.5 + Math.random() * 2.5;
    bubble.position.set(
      Math.sin(phi) * Math.cos(theta) * radius,
      Math.cos(phi) * radius + 1.5,
      Math.sin(phi) * Math.sin(theta) * radius + 2.5 // shift all bubbles forward in z
    );
    scene.add(bubble);
    bubbles.push({mesh: bubble, theta, phi, radius, speed: 0.18 + Math.random() * 0.38});
  }
  // Add floating pink cubes
  const cubes = [];
  const cubeCount = 120;
  for (let i = 0; i < cubeCount; i++) {
    const size = 0.08 + Math.random() * 0.08;
    const cubeGeom = new THREE.BoxGeometry(size, size, size);
    const cubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x7ed957, // light green
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
      clearcoat: 0.7,
      clearcoatRoughness: 0.1
    });
    const cube = new THREE.Mesh(cubeGeom, cubeMat);
    // Place cubes randomly in a sphere around the origin, but outside the model bounding radius
    let theta, phi, radius, pos;
    // Assume model is centered at (0,0,0) and has bounding radius ~2.5 (safe default if not loaded yet)
    const minRadius = (window.modelBox ? window.modelBox.getBoundingSphere(new THREE.Sphere()).radius : 2.5) + 0.5;
    do {
      theta = Math.random() * 2 * Math.PI;
      phi = Math.random() * Math.PI;
      radius = minRadius + Math.random() * 3.5;
      pos = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius + 1.5,
        Math.sin(phi) * Math.sin(theta) * radius
      );
    } while (pos.length() < minRadius + 0.1); // ensure outside model
    cube.position.copy(pos);
    // Give each cube a random velocity
    cube.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.04
    );
    scene.add(cube);
    cubes.push(cube);
  }
  // Set up a vertical gradient background (sky to grass) using a fixed div behind everything
  let bgDiv = document.getElementById('bg-gradient-div');
  if (!bgDiv) {
    bgDiv = document.createElement('div');
    bgDiv.id = 'bg-gradient-div';
    bgDiv.style.position = 'fixed';
    bgDiv.style.top = '0';
    bgDiv.style.left = '0';
    bgDiv.style.width = '100vw';
    bgDiv.style.height = '100vh';
    bgDiv.style.zIndex = '0';
    bgDiv.style.pointerEvents = 'none';
    bgDiv.style.background = '#7ed957'; // bright green
    document.body.insertBefore(bgDiv, document.body.firstChild);
  }
  // Make sure the 3D container is above the background
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = '10';
  container.style.overflow = 'hidden';

  // Add 2D clouds at the top (behind 3D canvas, above gradient)
  const cloudSVGs = [
    // SVG cloud shapes (white, semi-transparent)
    '<svg width="180" height="60" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="40" rx="40" ry="20" fill="#fff" fill-opacity="0.8"/><ellipse cx="90" cy="30" rx="50" ry="25" fill="#fff" fill-opacity="0.7"/><ellipse cx="140" cy="40" rx="30" ry="18" fill="#fff" fill-opacity="0.8"/></svg>',
    '<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="30" rx="30" ry="12" fill="#fff" fill-opacity="0.7"/><ellipse cx="70" cy="20" rx="35" ry="15" fill="#fff" fill-opacity="0.6"/><ellipse cx="100" cy="30" rx="20" ry="10" fill="#fff" fill-opacity="0.7"/></svg>',
    '<svg width="100" height="32" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="20" rx="20" ry="10" fill="#fff" fill-opacity="0.7"/><ellipse cx="60" cy="12" rx="30" ry="12" fill="#fff" fill-opacity="0.6"/><ellipse cx="85" cy="20" rx="15" ry="8" fill="#fff" fill-opacity="0.7"/></svg>'
  ];
  const cloudDivs = [];
  for (let i = 0; i < 6; i++) {
    const cloud = document.createElement('div');
    cloud.innerHTML = cloudSVGs[i % cloudSVGs.length];
    cloud.style.position = 'fixed';
    cloud.style.top = (16 + Math.random() * 40) + 'px';
    cloud.style.left = (5 + Math.random() * 85) + 'vw';
    cloud.style.zIndex = '2';
    cloud.style.pointerEvents = 'none';
    cloud.style.opacity = 0.7 + Math.random() * 0.2;
    cloud.style.transform = `scale(${0.8 + Math.random() * 0.7})`;
    document.body.appendChild(cloud);
    cloudDivs.push(cloud);
  }
  // Add fun overlay text
  const overlay = document.createElement('div');
  overlay.innerText = "This is Steven's website";
  overlay.style.position = 'fixed';
  overlay.style.top = '32px';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.textAlign = 'center';
  overlay.style.fontFamily = "'Luckiest Guy', cursive, 'Comic Sans MS', 'Comic Sans', sans-serif";
  overlay.style.fontSize = '3.2rem';
  overlay.style.color = '#e53935';
  overlay.style.textShadow = '2px 2px 0 #7c3f00, 4px 4px 8px #fff3';
  overlay.style.letterSpacing = '0.04em';
  overlay.style.userSelect = 'none';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '1000';
  document.body.appendChild(overlay);

  // Add Google Fonts link for Luckiest Guy
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap';
  document.head.appendChild(fontLink);

  // Load 3D model (GLTF/GLB with external assets)
  // Make sure you have extracted the .zip file so the .gltf and .bin files are present
  // and the textures folder is in the correct location.
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      'vaporwave_tokyo_sketchfab_3d_editor_challenge.glb',
      function (gltf) {
        const model = gltf.scene;
        // Compute bounding box to center controls on model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        // Move model back more and center at origin
        model.position.set(-center.x, -center.y, -6.5 - center.z);
        scene.add(model);
        // Set controls target to model center
        controls.target.set(0, 0, 0);
        controls.update();
        // Store model bounding box for cube collision
        window.modelBox = new THREE.Box3().setFromObject(model);
      },
      undefined,
      function (error) {
        console.error('An error happened while loading the model:', error);
      }
    );
  } else {
    console.error('GLTFLoader is not loaded. Please include GLTFLoader.js in your HTML.');
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // Animate bubbles: float up and slowly rotate
    bubbles.forEach(b => {
      b.mesh.position.y += 0.01 * b.speed;
      b.mesh.position.x = Math.sin(b.phi) * Math.cos(b.theta += 0.002 * b.speed) * b.radius;
      b.mesh.position.z = Math.sin(b.phi) * Math.sin(b.theta) * b.radius;
      if (b.mesh.position.y > 6) b.mesh.position.y = 1.5 + Math.random();
    });
    // Animate cubes: move and bounce off model
    cubes.forEach(cube => {
      cube.position.add(cube.userData.velocity);
      // Improved bounce: reflect velocity only if moving toward the model
      if (window.modelBox) {
        const cubeBox = new THREE.Box3().setFromObject(cube);
        if (cubeBox.intersectsBox(window.modelBox)) {
          // Find collision normal (approximate: from model center to cube)
          const modelCenter = window.modelBox.getCenter(new THREE.Vector3());
          const normal = cube.position.clone().sub(modelCenter).normalize();
          const v = cube.userData.velocity;
          const dot = v.dot(normal);
          if (dot < 0) {
            // Reflect velocity
            v.sub(normal.multiplyScalar(2 * dot));
          }
          // Move cube out of collision
          cube.position.add(normal.multiplyScalar(0.1));
        }
      }
      // Keep cubes in bounds
      if (cube.position.length() > 7) {
        cube.position.multiplyScalar(0.95);
        cube.userData.velocity.negate();
      }
    });
    renderer.render(scene, camera);
  }
  animate();
})();
