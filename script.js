// Sidebar and Theme Element bindings
const sidebarToggle = document.getElementById('sidebarToggle');
const appSidebar = document.getElementById('appSidebar');
const themeToggleCheckbox = document.getElementById('themeToggleCheckbox');
const rootHtml = document.documentElement;

// Initialize sidebar behavior according to responsive limits
function initSidebar() {
  if (window.innerWidth <= 768) {
    appSidebar.classList.add('hidden');
    appSidebar.classList.remove('active-mobile');
  } else {
    appSidebar.classList.remove('hidden');
  }
}
initSidebar();

// Sidebar visibility handler
sidebarToggle.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    appSidebar.classList.toggle('active-mobile');
  } else {
    appSidebar.classList.toggle('hidden');
  }
});

// Theme Selector Control Handler 
themeToggleCheckbox.addEventListener('change', (event) => {
  if (event.target.checked) {
    rootHtml.setAttribute('data-theme', 'dark');
  } else {
    rootHtml.setAttribute('data-theme', 'light');
  }
});

// Structural Navigation Controls
const navLinks = document.querySelectorAll('.gtk-nav-link');
const sections = document.querySelectorAll('.portfolio-section');

navLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault(); 
    
    navLinks.forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    
    const targetSectionId = link.getAttribute('data-target');
    sections.forEach(section => {
      if (section.id === targetSectionId) {
        section.classList.remove('hidden-section');
      } else {
        section.classList.add('hidden-section');
      }
    });
    
    if (window.innerWidth <= 768) {
      appSidebar.classList.remove('active-mobile');
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    appSidebar.classList.remove('active-mobile');
  }
});

/* =========================================================================
   THREE.JS 3D GLOWING SPHERE ENGINE - CONFIGURATION
   ========================================================================= */
const canvas = document.querySelector('#voidCanvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.z = 24;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false; 

let textSprite;
let textMaterial;

function createCenterTextTexture(textColor, glowColor) {
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 1024;
  texCanvas.height = 256;
  const ctx = texCanvas.getContext('2d');
  ctx.clearRect(0, 0, texCanvas.width, texCanvas.height);
  ctx.font = "bold 96px system-ui, -apple-system, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 16;
  ctx.fillStyle = textColor;
  ctx.fillText("TheVoidPointer", texCanvas.width / 2, texCanvas.height / 2);
  return new THREE.CanvasTexture(texCanvas);
}

function createAsteriskTexture(colorHex) {
  const size = 64;
  const texCanvas = document.createElement('canvas');
  texCanvas.width = size;
  texCanvas.height = size;
  const ctx = texCanvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.font = "bold 56px monospace";
  ctx.fillStyle = colorHex; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("*", size / 2, size / 2 + 10); 
  return new THREE.CanvasTexture(texCanvas);
}

const pointCount = 850; 
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(pointCount * 3);
const sphereRadius = 7.2; 

for (let i = 0; i < pointCount; i++) {
  const phi = Math.acos(-1 + (2 * i) / pointCount);
  const theta = Math.sqrt(pointCount * Math.PI) * phi;
  positions[i * 3] = sphereRadius * Math.cos(theta) * Math.sin(phi);
  positions[i * 3 + 1] = sphereRadius * Math.sin(theta) * Math.sin(phi);
  positions[i * 3 + 2] = sphereRadius * Math.cos(phi);
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.7,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const globeMesh = new THREE.Points(geometry, particleMaterial);
scene.add(globeMesh);

function synchronizeGlobeTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const textFill = isDark ? "#ffffff" : "#2e3436";
  const accentFocus = "#3584e4";
  
  const updatedTexture = createCenterTextTexture(textFill, accentFocus);
  if (!textSprite) {
    textMaterial = new THREE.SpriteMaterial({ map: updatedTexture, transparent: true });
    textSprite = new THREE.Sprite(textMaterial);
    scene.add(textSprite);
  } else {
    textMaterial.map.dispose();
    textMaterial.map = updatedTexture;
    textMaterial.needsUpdate = true;
  }

  const updatedAsterisk = createAsteriskTexture(accentFocus);
  if (particleMaterial.map) particleMaterial.map.dispose();
  particleMaterial.map = updatedAsterisk;
  particleMaterial.needsUpdate = true;
  
  handleResponsiveScaling();
}

function handleResponsiveScaling() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);

  if (window.innerWidth <= 480) {
    textSprite.scale.set(11.0, 2.75, 1);
    camera.position.z = 28;
  } else if (window.innerWidth <= 768) {
    textSprite.scale.set(12.0, 3.0, 1);
    camera.position.z = 24;
  } else if (window.innerWidth <= 1200) {
    textSprite.scale.set(13.0, 3.25, 1);
    camera.position.z = 21;
  } else {
    textSprite.scale.set(14.0, 3.5, 1);
    camera.position.z = 19;
  }
}

window.addEventListener('resize', handleResponsiveScaling);

if (themeToggleCheckbox) {
  themeToggleCheckbox.addEventListener('change', () => {
    setTimeout(synchronizeGlobeTheme, 10);
  });
}

synchronizeGlobeTheme();

function animate() {
  requestAnimationFrame(animate);
  globeMesh.rotation.y += 0.0012;
  globeMesh.rotation.x += 0.0004;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Link the overview layout action row button to the dynamic section tab router
const projectTriggerBtn = document.querySelector('.project-trigger-btn');
if (projectTriggerBtn) {
  projectTriggerBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const projectTargetLink = document.querySelector('.gtk-nav-link[data-target="projects-section"]');
    if (projectTargetLink) {
      projectTargetLink.click();
    }
  });
}

// Link the contact button trigger to the sidebar layout workspace navigation router
const contactTriggerBtn = document.querySelector('.contact-trigger-btn');
if (contactTriggerBtn) {
  contactTriggerBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const contactTargetLink = document.querySelector('.gtk-nav-link[data-target="contact-section"]');
    if (contactTargetLink) {
      contactTargetLink.click();
    }
  });
}