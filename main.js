import * as THREE from 'three';

// --- Scroll Reveal logic ---
const revealOnScroll = () => {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
};

class DomainExpansion {
    constructor() {
        this.canvas = document.querySelector('#three-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050000, 0.4);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 15);
        this.originalCameraPos = this.camera.position.clone();

        this.clock = new THREE.Clock();
        this.slashes = [];
        this.tendrils = [];
        this.bloodParticles = [];

        // Expansion state
        this.isExpanding = true;
        this.expansionProgress = 0;
        this.shakeIntensity = 0;

        // Form states
        this.isHeian = false;
        this.revealProgress = 0;

        // Cached resources for memory efficiency
        this.slashMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
        this.bloodGeo = new THREE.SphereGeometry(0.06, 4, 4);
        this.bloodMat = new THREE.MeshBasicMaterial({ color: 0x880000 });

        this.init();
    }

    async init() {
        this.setSize();
        this.createShrine();
        this.createSkulls();
        this.createBarrier();
        this.createAtmosphere();
        this.createTendrils();

        this.loader = new THREE.TextureLoader();

        try {
            await this.preloadHeianAssets();
            this.createHeianForm();
        } catch (err) {
            console.error("Failed to load Heian assets:", err);
        }

        this.addLightning();
        this.addEventListeners();
        this.animate();

        const flash = document.createElement('div');
        flash.className = 'expansion-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.classList.add('active'), 100);
    }

    setSize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    createShrine() {
        this.shrineGroup = new THREE.Group();
        this.shrineGroup.scale.setScalar(0.001);

        const darkMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9, metalness: 0.1 });
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x220000 });
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.3 });

        // 1. Tiered Base
        const mainBase = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 10), darkMat);
        this.shrineGroup.add(mainBase);

        // 2. The Malevolent Mouth (Interior)
        this.mouthCenter = new THREE.Mesh(new THREE.CircleGeometry(3.5, 32), mouthMat);
        this.mouthCenter.position.set(0, 3, 0.2);
        this.shrineGroup.add(this.mouthCenter);

        // 3. Teeth (Upper & Lower)
        const toothGeo = new THREE.ConeGeometry(0.2, 1.2, 4);
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI - Math.PI / 2;
            const r = 3.6;

            // Upper Jaws
            const upTooth = new THREE.Mesh(toothGeo, toothMat);
            upTooth.position.set(Math.cos(angle) * r, 3.5 + Math.sin(angle) * 1.5, 0.3);
            upTooth.rotation.z = angle + Math.PI;
            this.shrineGroup.add(upTooth);

            // Lower Jaws
            const lowTooth = new THREE.Mesh(toothGeo, toothMat);
            lowTooth.position.set(Math.cos(angle) * r, 2.5 - Math.sin(angle) * 1.5, 0.3);
            lowTooth.rotation.z = angle;
            this.shrineGroup.add(lowTooth);
        }

        // 4. Multi-Tiered Roof
        const createTier = (y, size, height) => {
            const tier = new THREE.Mesh(new THREE.ConeGeometry(size, height, 4), darkMat);
            tier.position.y = y;
            tier.rotation.y = Math.PI / 4;
            return tier;
        };
        this.shrineGroup.add(createTier(5.5, 6.5, 1.8), createTier(6.5, 4.5, 1.4));

        // 5. Pillars
        const pillGeo = new THREE.CylinderGeometry(0.2, 0.2, 5);
        [[-4, 4], [-4, -4], [4, 4], [4, -4]].forEach(p => {
            const pill = new THREE.Mesh(pillGeo, darkMat);
            pill.position.set(p[0], 2.5, p[1]);
            this.shrineGroup.add(pill);
        });

        this.scene.add(this.shrineGroup);
    }

    createHeianForm() {
        this.sukunaGroup = new THREE.Group();
        this.sukunaGroup.position.set(0, 3.5, 8);
        this.sukunaGroup.scale.setScalar(0.001);
        this.scene.add(this.sukunaGroup);

        if (!this.heianTextures) return;

        // 1. Heian Veil (Rotated background - Size reduced as requested)
        const veilGeo = new THREE.PlaneGeometry(40, 40);
        this.heianVeil = new THREE.Mesh(veilGeo, new THREE.MeshBasicMaterial({
            map: this.heianTextures.veil, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, fog: false
        }));
        this.heianVeil.position.z = -15; // Still deeply behind, but visible
        this.heianVeil.renderOrder = 0; // Render first
        this.sukunaGroup.add(this.heianVeil);

        // 2. Sukuna True Anime Form (Requested Image - Black background dynamically removed)
        const geo = new THREE.PlaneGeometry(12, 12);
        
        const baseMat = new THREE.MeshBasicMaterial({ 
            map: this.heianTextures.base, transparent: true, side: THREE.DoubleSide, fog: false 
        });
        // Advanced Custom Shader to discard pitch-black background pixels of JPEG-like images
        baseMat.onBeforeCompile = function ( shader ) {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `
                #include <map_fragment>
                if (diffuseColor.r < 0.05 && diffuseColor.g < 0.05 && diffuseColor.b < 0.05) {
                    discard;
                }
                `
            );
        };

        this.heianBase = new THREE.Mesh(geo, baseMat);
        this.heianBase.position.y = -1;
        this.heianBase.position.z = 0;
        this.heianBase.renderOrder = 2; // Render after veil
        
        this.sukunaGroup.add(this.heianBase);
        this.isHeian = true;
    }

    createFireArrow() {
        this.fireArrow = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.01, 4, 8),
            new THREE.MeshBasicMaterial({ color: 0xffa500, emissive: 0xff4500 })
        );
        this.fireArrow.rotation.z = Math.PI / 2;
        this.fireArrow.position.set(0, 0, 0.2);
        this.sukunaGroup.add(this.fireArrow);

        // Glow point
        const arrowLight = new THREE.PointLight(0xffa500, 10, 5);
        this.fireArrow.add(arrowLight);
    }

    preloadHeianAssets() {
        const assets = [
            '/sukuna_pose.png',
            '/heian_sukuna_veil.png'
        ];
        const promises = assets.map(url => {
            return new Promise((resolve) => {
                this.loader.load(url, (t) => resolve(t));
            });
        });
        return Promise.all(promises).then(textures => {
            this.heianTextures = {
                base: textures[0],
                veil: textures[1]
            };
        });
    }

    switchToHeian() {
        if (!this.heianTextures) return;

        // Remove current mesh
        this.sukunaGroup.remove(this.sukunaMain);

        // Create Heian Layers
        const geo = new THREE.PlaneGeometry(6, 6);

        // 1. Base Body
        this.heianBase = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
            map: this.heianTextures.base, transparent: true, alphaTest: 0.2, fog: false
        }));
        this.heianBase.renderOrder = 1;

        // 2. Stomach Mouth (Slightly forward)
        this.heianMouth = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
            map: this.heianTextures.mouth, transparent: true, opacity: 1, fog: false
        }));
        this.heianMouth.position.z = 0.05;
        this.heianMouth.renderOrder = 2;

        this.sukunaGroup.add(this.heianBase, this.heianMouth);
        this.isHeian = true;

        // Trigger screen shake
        this.shakeIntensity = 0.5;
        this.pLight.color.set(0xffffff);
        this.pLight.intensity = 50;
        setTimeout(() => {
            this.pLight.color.set(0xff1e1e);
            this.pLight.intensity = 15;
        }, 500);
    }

    createSkulls() {
        const skullGeo = new THREE.IcosahedronGeometry(0.15, 0);
        const skullMat = new THREE.MeshPhongMaterial({ color: 0xf2eadf });
        this.skullGroup = new THREE.Group();
        this.skullGroup.scale.setScalar(0.001);
        for (let i = 0; i < 400; i++) {
            const skull = new THREE.Mesh(skullGeo, skullMat);
            const radius = 3 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            skull.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.5, Math.sin(angle) * radius);
            skull.rotation.set(Math.random(), Math.random(), Math.random());
            this.skullGroup.add(skull);
        }
        this.scene.add(this.skullGroup);
    }

    createBarrier() {
        this.barrier = new THREE.Mesh(
            new THREE.SphereGeometry(15, 64, 64),
            new THREE.MeshStandardMaterial({
                color: 0x200000, transparent: true, opacity: 0,
                side: THREE.BackSide, emissive: 0xff1e1e, emissiveIntensity: 0,
                depthWrite: false // Crucial: barrier shouldn't hide objects inside
            })
        );
        this.barrier.scale.setScalar(0.01);
        this.scene.add(this.barrier);
    }

    createTendrils() {
        this.tendrilGroup = new THREE.Group();
        const mat = new THREE.LineBasicMaterial({ color: 0xff1e1e, transparent: true, opacity: 0 });
        for (let i = 0; i < 50; i++) {
            const points = [];
            const radius = 10 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const start = new THREE.Vector3(Math.cos(angle) * radius, (Math.random() - 0.5) * 10, Math.sin(angle) * radius);
            for (let j = 0; j <= 5; j++) {
                const t = j / 5;
                const p = new THREE.Vector3().lerpVectors(start, new THREE.Vector3(0, 0, 0), t);
                p.x += Math.sin(t * Math.PI) * (Math.random() - 0.5) * 2;
                p.y += Math.sin(t * Math.PI) * (Math.random() - 0.5) * 2;
                points.push(p);
            }
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat.clone());
            this.tendrilGroup.add(line);
        }
        this.scene.add(this.tendrilGroup);
    }

    createAtmosphere() {
        this.glow = new THREE.Mesh(
            new THREE.SphereGeometry(30, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x4a0000, side: THREE.BackSide, transparent: true, opacity: 0 })
        );
        this.scene.add(this.glow);
    }

    addLightning() {
        // Strict Red/Black theme, no blue
        this.scene.fog = new THREE.FogExp2(0x050000, 0.12);
        this.pLight = new THREE.PointLight(0xff1e1e, 25, 60);
        this.pLight.position.set(0, 5, 12);
        this.scene.add(this.pLight);
        this.scene.add(new THREE.AmbientLight(0xff3300, 0.4));

        // Cursed Ground Glow (Deep Crimson)
        const groundLight = new THREE.PointLight(0xaa0000, 40, 30);
        groundLight.position.set(0, -5, 5);
        this.scene.add(groundLight);
    }

    createSlash() {
        const start = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([start, start.clone().add(dir.multiplyScalar(6 + Math.random() * 10))]),
            this.slashMat
        );
        this.scene.add(line);

        // Effects
        if (Math.random() > 0.8) {
            this.createBloodSplash(start);
            this.shakeIntensity = 0.2;
        }

        this.slashes.push({ line, time: 0, life: 0.1 });
    }

    createBloodSplash(pos) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const p = new THREE.Mesh(this.bloodGeo, this.bloodMat);
            p.position.copy(pos);
            const vel = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() * 0.3), (Math.random() - 0.5) * 0.3);
            this.bloodParticles.push({ mesh: p, vel, life: 2.5 });
            this.scene.add(p);
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.setSize());
        window.addEventListener('mousemove', (e) => {
            if (this.isExpanding) return;
            const tx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ty = -(e.clientY / window.innerHeight - 0.5) * 2;
            const targetX = tx * 2;
            const targetY = ty * 2 + 2;
            this.camera.position.x += (targetX - this.camera.position.x) * 0.02;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.02;
            this.camera.lookAt(0, 2.5, 0);

            // True 3D depth parallax
            if (this.isHeian && this.sukunaGroup) {
                if (this.heianBase) {
                    this.heianBase.position.x = tx * -0.5;
                    this.heianBase.position.y = (ty * -0.1) - 1;
                }
                if (this.heianVeil) {
                    this.heianVeil.position.x = tx * -2;
                    this.heianVeil.position.y = ty * -1;
                }
            }
        });

        const revealBtn = document.getElementById('reveal-true-form');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => {
                if (!this.isHeian) {
                    this.switchToHeian();
                    revealBtn.querySelector('span:last-child').innerText = 'True Form Manifested';
                    revealBtn.style.borderColor = '#fff';
                    revealBtn.style.color = '#fff';
                }
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        if (this.isExpanding) {
            this.expansionProgress += delta * 0.4;
            const p = Math.min(this.expansionProgress, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            this.shrineGroup.scale.setScalar(ease);
            this.sukunaGroup.scale.setScalar(ease);
            this.pLight.intensity = p * 40;
            if (p >= 1) {
                this.isExpanding = false;
                document.querySelector('#app').classList.add('domain-active');
            }
        } else {
            // Intense Domain Activity
            if (this.shrineGroup) this.shrineGroup.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
            if (this.sukunaGroup) {
                this.sukunaGroup.position.y = 2.5 + Math.sin(Date.now() * 0.002) * 0.05;
                if (this.heianVeil) this.heianVeil.rotation.z += 0.004;
            }
            if (Math.random() > 0.7) this.createSlash();
        }

        // Camera Shake
        if (this.shakeIntensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.9;
        }

        // Update slashes
        for (let i = this.slashes.length - 1; i >= 0; i--) {
            const s = this.slashes[i];
            s.time += delta;
            if (s.time > s.life) {
                this.scene.remove(s.line);
                s.line.geometry.dispose(); // Prevent WebGL memory leak
                this.slashes.splice(i, 1);
            }
        }

        // Update blood
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            const p = this.bloodParticles[i];
            p.mesh.position.add(p.vel);
            p.vel.y -= 0.005; // Gravity
            p.life -= delta;
            p.mesh.scale.setScalar(p.life);
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.bloodParticles.splice(i, 1);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    revealOnScroll();
    new DomainExpansion();

    // Ripple Effect
    const rippleButtons = document.querySelectorAll(".ripple");
    rippleButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const circle = document.createElement("span");
            const diameter = Math.max(btn.clientWidth, btn.clientHeight);
            const radius = diameter / 2;
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
            circle.classList.add("ripple-span");
            btn.appendChild(circle);
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
