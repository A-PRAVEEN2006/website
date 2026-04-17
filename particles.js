import * as THREE from 'three';

export function initParticles() {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 50;

    // Create Particles (Grudge / Ash)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Position
        posArray[i] = (Math.random() - 0.5) * 150;
        
        // Colors: mostly dark reds, blacks, and some intense crimsons
        if (i % 3 === 0) { // R
            colorArray[i] = Math.random() > 0.5 ? Math.random() : 0.1;
        } else if (i % 3 === 1) { // G
            colorArray[i] = 0;
        } else { // B
            colorArray[i] = 0;
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Particle Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        
        // Slow rotation and upward drift
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;
        
        // Dynamic jitter / grudge feeling based on mouse
        particlesMesh.position.x += (mouseX * 5 - particlesMesh.position.x) * 0.05;
        particlesMesh.position.y += (-mouseY * 5 - particlesMesh.position.y) * 0.05;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    // Resize Handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
