/* ════════════════════════════════════════════════════════
   ARCOBEL — HERO3D.JS
   Viewport 3D hard-surface dans le hero.
   Requires Three.js via CDN.

   Dans <head> :
   <script src="https://cdn.jsdelivr.net/npm/three@0.163/build/three.min.js"></script>

   Avant </body> (après identity.js) :
   <script src="hero3d.js"></script>
   ════════════════════════════════════════════════════════ */

(function () {
  if (typeof THREE === 'undefined') {
    console.warn('hero3d.js: Three.js not loaded');
    return;
  }

  /* ── Setup ── */
  const hero = document.getElementById('hero');
  if (!hero) return;

  const W = () => hero.offsetWidth;
  const H = () => hero.offsetHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.style.cssText = `
    position:absolute;
    top:0; right:0;
    width:55%; height:100%;
    pointer-events:none;
    z-index:1;
  `;
  hero.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W() * 0.55 / H(), 0.1, 100);
  camera.position.set(0, 0, 5.5);

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    camera.aspect = W() * 0.55 / H();
    camera.updateProjectionMatrix();
  });

  /* ── Materials ── */

  // Solid face — sombre avec légère iridescence violet
  const matSolid = new THREE.MeshStandardMaterial({
    color: 0x0a0a14,
    roughness: 0.35,
    metalness: 0.9,
    envMapIntensity: 1.2,
  });

  // Wireframe lumineux — violet
  const matWire = new THREE.LineBasicMaterial({
    color: 0x5F47E7,
    transparent: true,
    opacity: 0.7,
  });

  // Wireframe secondaire — blanc très subtil
  const matWireFaint = new THREE.LineBasicMaterial({
    color: 0x9988ff,
    transparent: true,
    opacity: 0.18,
  });

  // Points/vertex — blanc
  const matPoints = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.025,
    transparent: true,
    opacity: 0.6,
  });

  /* ── Lights ── */
  const ambientLight = new THREE.AmbientLight(0x111122, 2);
  scene.add(ambientLight);

  const light1 = new THREE.PointLight(0x5F47E7, 12, 20);
  light1.position.set(3, 3, 3);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x2211aa, 8, 15);
  light2.position.set(-3, -2, 2);
  scene.add(light2);

  const light3 = new THREE.PointLight(0xffffff, 3, 10);
  light3.position.set(0, 4, 4);
  scene.add(light3);

  /* ── Helper: build solid + wireframe group ── */
  function buildMesh(geometry, solidMat, wireMat, faintMat) {
    const group = new THREE.Group();

    // Solid
    const solid = new THREE.Mesh(geometry, solidMat);
    group.add(solid);

    // Primary wireframe
    const wireGeo = new THREE.WireframeGeometry(geometry);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wire);

    // Vertex points
    const pts = new THREE.Points(geometry, matPoints);
    group.add(pts);

    return group;
  }

  /* ── OBJET PRINCIPAL — TorusKnot (hard-surface feel) ── */
  const torusGeo = new THREE.TorusKnotGeometry(1, 0.32, 120, 16, 2, 3);
  const mainObj = buildMesh(torusGeo, matSolid, matWire, matWireFaint);
  mainObj.position.set(0.3, 0, 0);
  scene.add(mainObj);

  /* ── OBJET SECONDAIRE — Icosaèdre (debris / fragment) ── */
  const icoGeo = new THREE.IcosahedronGeometry(0.55, 1);
  const matSolid2 = new THREE.MeshStandardMaterial({
    color: 0x080810,
    roughness: 0.5,
    metalness: 0.8,
  });
  const matWire2 = new THREE.LineBasicMaterial({
    color: 0x7B63FF,
    transparent: true,
    opacity: 0.45,
  });
  const icoObj = buildMesh(icoGeo, matSolid2, matWire2, matWireFaint);
  icoObj.position.set(-1.8, 1.1, -1.2);
  icoObj.scale.setScalar(0.7);
  scene.add(icoObj);

  /* ── OBJET TERTIAIRE — Octaèdre flottant (très petit) ── */
  const octGeo = new THREE.OctahedronGeometry(0.3, 0);
  const matWire3 = new THREE.LineBasicMaterial({
    color: 0xaaaaff,
    transparent: true,
    opacity: 0.25,
  });
  const octObj = buildMesh(octGeo, new THREE.MeshStandardMaterial({
    color: 0x050508, roughness: 0.6, metalness: 0.7
  }), matWire3, matWireFaint);
  octObj.position.set(1.6, -1.3, -0.8);
  octObj.scale.setScalar(0.6);
  scene.add(octObj);

  /* ── Viewport HUD overlay (SVG CSS positionné) ── */
  const hud = document.createElement('div');
  hud.style.cssText = `
    position:absolute;
    top:0; right:0;
    width:55%; height:100%;
    pointer-events:none;
    z-index:2;
    font-family:'DM Mono',monospace;
    font-size:0.52rem;
    letter-spacing:0.14em;
    color:rgba(95,71,231,0.4);
  `;
  hud.innerHTML = `
    <!-- Corner brackets -->
    <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
      <polyline points="0,0 0,8" stroke="rgba(95,71,231,0.35)" stroke-width="0.4"/>
      <polyline points="0,0 8,0" stroke="rgba(95,71,231,0.35)" stroke-width="0.4"/>
      <polyline points="92,0 100,0 100,8" stroke="rgba(95,71,231,0.35)" stroke-width="0.4"/>
      <polyline points="0,92 0,100 8,100" stroke="rgba(95,71,231,0.35)" stroke-width="0.4"/>
      <polyline points="92,100 100,100 100,92" stroke="rgba(95,71,231,0.35)" stroke-width="0.4"/>
    </svg>
    <span style="position:absolute;top:0.7rem;left:0.9rem;color:rgba(232,153,74,0.5)">PERSPECTIVE</span>
    <span style="position:absolute;top:0.7rem;right:0.9rem;color:rgba(95,71,231,0.45)">UE5</span>
    <span style="position:absolute;bottom:0.7rem;left:0.9rem;color:rgba(95,71,231,0.35)" id="hud-tris">Tris: —</span>
    <span style="position:absolute;bottom:0.7rem;right:0.9rem;color:rgba(232,153,74,0.4)">LOD0</span>
  `;
  hero.appendChild(hud);

  // Tris count
  let triCount = 0;
  scene.traverse(obj => {
    if (obj.isMesh && obj.geometry) {
      const pos = obj.geometry.attributes.position;
      if (pos) triCount += pos.count / 3;
    }
  });
  const hudTris = document.getElementById('hud-tris');
  if (hudTris) hudTris.textContent = `Tris: ${Math.round(triCount).toLocaleString()}`;

  /* ── Mouse influence ── */
  let mx = 0, my = 0, smx = 0, smy = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── Animate ── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    smx += (mx - smx) * 0.04;
    smy += (my - smy) * 0.04;

    // Main object — rotation lente + réaction souris
    mainObj.rotation.x = t * 0.18 + smy * 0.25;
    mainObj.rotation.y = t * 0.26 + smx * 0.35;

    // Icosaèdre — rotation inverse, plus rapide
    icoObj.rotation.x = -t * 0.22;
    icoObj.rotation.y =  t * 0.31 + smx * 0.2;
    icoObj.rotation.z =  t * 0.09;

    // Octaèdre — flottement
    octObj.rotation.x = t * 0.35;
    octObj.rotation.z = t * 0.2 - smx * 0.15;
    octObj.position.y = -1.3 + Math.sin(t * 0.8) * 0.12;

    // Light orbite
    light1.position.x = Math.sin(t * 0.5) * 4;
    light1.position.y = Math.cos(t * 0.4) * 3;

    renderer.render(scene, camera);
  }

  animate();

  /* ── Mobile : cacher sur petit écran ── */
  function checkMobile() {
    const isMobile = window.innerWidth < 768;
    canvas.style.display = isMobile ? 'none' : 'block';
    hud.style.display    = isMobile ? 'none' : 'block';
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);

})();
