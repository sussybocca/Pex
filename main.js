import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Attach to canvas container if editor, else body
const canvasContainer = document.getElementById("canvas-container") || document.body;
canvasContainer.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 50);
scene.add(light);

// Loaders
const loader = new FBXLoader();

// Detect mode: editor.html or index.html
const isEditor = window.location.pathname.includes("editor.html");

// --- World Loading Functions ---
async function loadWorldFromJSON(world, basePath = "") {
  // Load FBX assets
  for (const asset of world.assets) {
    const url = basePath + asset;
    loader.load(url, (obj) => scene.add(obj));
  }

  // Load scripts dynamically
  for (const script of world.scripts) {
    try {
      const mod = await import(basePath + script);
      if (mod.default) mod.default(scene);
    } catch (err) {
      console.error("Failed to load script:", script, err);
    }
  }
}

// --- Viewer Mode ---
async function initViewer() {
  // Get world path from URL: /P/Y/W/S
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const worldPath = pathSegments.join("/");

  try {
    const resp = await fetch(`/${worldPath}/world.json`);
    const world = await resp.json();
    await loadWorldFromJSON(world, `/${worldPath}/`);
  } catch (err) {
    console.error("Failed to load world:", err);
  }
}

// --- Editor Mode ---
async function initEditor() {
  // Load default world.json in root
  try {
    const resp = await fetch("/world.json");
    const world = await resp.json();
    await loadWorldFromJSON(world, "/");
  } catch (err) {
    console.warn("No default world.json found:", err);
  }

  // --- FBX Upload ---
  document.getElementById("fbxInput")?.addEventListener("change", async (e) => {
    for (const file of e.target.files) {
      const form = new FormData();
      form.append("fbx", file);

      try {
        const resp = await fetch("/api/parseFBX", { method: "POST", body: form });
        const data = await resp.json();
        if (data.success) console.log("Parsed FBX:", data.fbx);
        else console.error(data.error);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  });

  // --- Script Upload ---
  document.getElementById("scriptInput")?.addEventListener("change", (e) => {
    for (const file of e.target.files) {
      const list = document.getElementById("script-list");
      const item = document.createElement("div");
      item.className = "list-item";
      item.textContent = file.name;
      list.appendChild(item);
    }
  });

  // --- Texture Upload ---
  document.getElementById("textureInput")?.addEventListener("change", (e) => {
    for (const file of e.target.files) {
      const list = document.getElementById("asset-list");
      const item = document.createElement("div");
      item.className = "list-item";
      item.textContent = file.name;
      list.appendChild(item);
    }
  });

  // --- Import .PeX ---
  const pexInput = document.getElementById("pexInput");
  document.getElementById("importPexBtn")?.addEventListener("click", () => {
    pexInput.click();
  });

  pexInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const form = new FormData();
    form.append("pexFile", file);

    try {
      const resp = await fetch("/api/importPex", { method: "POST", body: form });
      const data = await resp.json();
      if (data.success) await loadWorldFromJSON(data.world, "/");
    } catch (err) {
      console.error("Failed to import .PeX:", err);
    }
  });

  // --- Export .PeX ---
  document.getElementById("exportPexBtn")?.addEventListener("click", async () => {
    const form = new FormData();
    form.append("worldFolderPath", ".");
    form.append("worldName", "MyWorld");

    try {
      const resp = await fetch("/api/exportPex", { method: "POST", body: form });
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "MyWorld.PeX";
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  });
}

// --- Initialize ---
if (isEditor) {
  initEditor();
} else {
  initViewer();
}

// --- Render loop ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// --- Responsive ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
