import { initParticles } from './particles.js';

// --- Assets ---
const sukunaBgm = new Audio('/sukuna_ost.mp3');
sukunaBgm.loop = true;
sukunaBgm.volume = 0; // Starts at 0, fades in

const idleBgm = new Audio('/idle_bgm.mp3');
idleBgm.loop = true;
idleBgm.volume = 0;

// --- State Management ---
const state = {
    isDomainActive: false,
    pullThreshold: 150,
    currentPull: 0,
    isDragging: false,
    activeApp: null,
    audioUnlocked: false
};

// --- DOM Elements ---
const body = document.body;
const pullRope = document.getElementById('pull-rope');
const flash = document.getElementById('flash');
const appLandings = document.getElementById('app-landings');
const mainContent = document.getElementById('main-content');
const backBtn = document.getElementById('back-to-shrine');

// --- Pull Rope Logic ---
const initPullRope = () => {
    if (!pullRope) return;

    const startDrag = (e) => {
        if (e.cancelable) e.preventDefault();
        state.isDragging = true;
        state.startY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        pullRope.style.transition = 'none';
        body.classList.add('grabbing');

        // Prime audio capabilities quietly 
        if (!state.audioUnlocked) {
            state.audioUnlocked = true;
            sukunaBgm.play().then(() => {
                sukunaBgm.pause(); // Prime without playing yet
            }).catch(e => console.warn('Audio prime failed', e));
        }

        const domainVideo = document.getElementById('domain-video');
        if (domainVideo && !state.videoUnlocked) {
            state.videoUnlocked = true;
            domainVideo.load(); // Primes the engine during user interaction
        }
    };

    const onDrag = (e) => {
        if (!state.isDragging) return;
        if (e.cancelable) e.preventDefault();
        const currentY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        const diff = currentY - state.startY;
        
        if (diff > 0 && diff <= state.pullThreshold + 50) {
            state.currentPull = diff;
            pullRope.style.transform = `translateY(${diff}px)`;
            
            // Visual indicator that domain expansion is fully primed prior to release
            const glow = document.querySelector('.eye-glow');
            if (glow) {
                if (diff >= state.pullThreshold && !state.isDomainActive) {
                    glow.style.opacity = '1';
                    glow.style.background = 'radial-gradient(circle, rgba(0,229,255,0.8) 0%, transparent 70%)';
                } else {
                    glow.style.opacity = '0';
                }
            }
        }
    };

    const endDrag = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        
        if (state.currentPull >= state.pullThreshold && !state.isDomainActive) {
            triggerDomainExpansion();
        } else {
            const glow = document.querySelector('.eye-glow');
            if (glow) glow.style.opacity = '0';
        }

        state.currentPull = 0;
        pullRope.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        pullRope.style.transform = 'translateY(0)';
        body.classList.remove('grabbing');
    };

    pullRope.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);

    // Touch support
    pullRope.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
};

const startMusicOverlay = () => {
    sukunaBgm.volume = 0;
    sukunaBgm.play().then(() => {
        let fadeAudio = setInterval(() => {
            // Cap at 0.15 for low immersive volume
            if (sukunaBgm.volume < 0.15) sukunaBgm.volume = Math.min(0.15, sukunaBgm.volume + 0.01);
            else clearInterval(fadeAudio);
        }, 150);
    }).catch(e => console.warn('BGM play failed', e));
};

// --- Domain Expansion Logic ---
const triggerDomainExpansion = () => {
    state.isDomainActive = true;
    
    // 1. Play Flash Effect
    flash.classList.add('active');
    
    // Stop idle background music
    let fadeOut = setInterval(() => {
        if (idleBgm.volume > 0.05) idleBgm.volume -= 0.05;
        else {
            idleBgm.pause();
            clearInterval(fadeOut);
        }
    }, 100);
    
    const domainVideo = document.getElementById('domain-video');
    // Start video synchronously before any timeouts to satisfy strict autoplay policies
    if (domainVideo) {
        domainVideo.volume = 0.5;
        domainVideo.play().catch(e => {
            console.warn('Video autoplay failed:', e);
            body.classList.remove('domain-video-playing');
            body.classList.add('domain-active');
            startMusicOverlay(); // Fallback if video fails
        });
        
        domainVideo.onended = () => {
            body.classList.remove('domain-video-playing');
            body.classList.add('domain-active');
            startMusicOverlay(); // Play quiet OST AFTER video completes
        };
    } else {
        setTimeout(startMusicOverlay, 1500); // Standard fallback
    }
    
    // 2. Change Body Classes asynchronously 
    setTimeout(() => {
        body.classList.remove('shrine-dimmed');
        if (domainVideo) {
            // Check if it didn't fail and is playing
            if (!domainVideo.paused) {
                body.classList.add('domain-video-playing');
            }
        } else {
            body.classList.add('domain-active');
        }
        
        // 3. Subtle camera shake entry
        mainContent.style.animation = 'cameraShake 0.5s ease-out';
    }, 100);

    // 4. Cleanup flash
    setTimeout(() => {
        flash.classList.remove('active');
    }, 1500);
};

// --- Startup ---
document.addEventListener('DOMContentLoaded', () => {
    initPullRope();
    initParticles();

    // Manage Interactive JJK Splash Screen
    const splash = document.getElementById('jjk-splash');
    if (splash) {
        splash.addEventListener('click', () => {
            // Unlock audio on click
            idleBgm.play().then(() => {
                let fade = setInterval(() => {
                    if (idleBgm.volume < 0.2) idleBgm.volume = Math.min(0.2, idleBgm.volume + 0.02);
                    else clearInterval(fade);
                }, 200);
            }).catch(e => console.warn('Idle BGM failed', e));

            // Trigger ultra-slow fade
            splash.style.transition = 'opacity 4s ease';
            splash.style.opacity = '0';
            
            // Drop pulley from ceiling
            const ropeContainer = document.querySelector('.pull-rope-container');
            if (ropeContainer) {
                setTimeout(() => {
                    ropeContainer.classList.remove('hidden-pull');
                }, 500);
            }

            setTimeout(() => splash.remove(), 4000);
        });
    }

    // Custom Cleave/Dismantle Cursor
    const cursor = document.getElementById('slash-cursor');
    if (cursor) {
        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        window.addEventListener('mousedown', (e) => {
            if(state.isDragging) return;
            cursor.classList.add('active');
            
            const slash = document.createElement('div');
            slash.classList.add('slash-mark');
            slash.style.left = e.clientX + 'px';
            slash.style.top = e.clientY + 'px';
            slash.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
            
            document.body.appendChild(slash);
            setTimeout(() => slash.remove(), 300);
        });

        window.addEventListener('mouseup', () => cursor.classList.remove('active'));
    }

    // View Transitions (Page Slicing) handling
    document.querySelectorAll('.premium-app-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            document.body.classList.add('is-transitioning');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600); // Wait for CSS slash animation to close
        });
    });

    // 3D Parallax Effect for Background Image
    const domainWrapper = document.getElementById('domain-wrapper');
    const domainBg = document.getElementById('domain-bg');

    if (domainWrapper) {
        window.addEventListener('mousemove', (e) => {
            if (!state.isDomainActive) return; // Only parallax when active

            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            // subtle rotation and movement
            const rotateX = y * -5; // Max 5 degrees
            const rotateY = x * 5;
            const translateX = x * -20; // Move up to 20px
            const translateY = y * -20;

            domainWrapper.style.transform = `translateZ(-100px) scale(1.1) translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    }

    // Ripple effect initialization
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            this.appendChild(ripples);
            setTimeout(() => {
                ripples.remove()
            }, 800);
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            e.preventDefault();
            const target = document.querySelector(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 3D Scroll Interaction for About Section
    const aboutSection = document.getElementById('about');
    const aboutContent = document.querySelector('.about-content');
    
    if (aboutSection && aboutContent) {
        aboutContent.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';
        aboutContent.style.transformStyle = 'preserve-3d';

        window.addEventListener('scroll', () => {
            const rect = aboutSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const totalDistance = windowHeight + rect.height;
            const currentDistance = windowHeight - rect.top;
            let progress = currentDistance / totalDistance;
            
            progress = Math.max(0, Math.min(1, progress));
            
            if (progress >= 0 && progress <= 1) {
                const offset = progress - 0.5;
                const rotateX = offset * -80; 
                const scale = 1 - Math.abs(offset) * 0.4;
                const translateZ = Math.abs(offset) * -300;
                const translateY = offset * 150;
                const opacity = 1 - Math.abs(offset) * 1.8;

                aboutContent.style.transform = `perspective(1000px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`;
                aboutContent.style.opacity = Math.max(0, opacity);
            }
        });
        
        // Trigger once to set initial state before scroll
        window.dispatchEvent(new Event('scroll'));
    }
});

