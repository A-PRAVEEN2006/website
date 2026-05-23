import { initParticles } from './particles.js';
import { initInsectSimulation, startFireBurn, stopFireBurn } from './insects.js';




// --- State Management ---
const state = {
    isDomainActive: false,
    pullThreshold: 150,
    currentPull: 0,
    isDragging: false,
    activeApp: null,
    audioUnlocked: false,
    insectLoopId: null
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



const completeDomainTransition = () => {
    body.classList.remove('domain-video-playing');
    body.classList.add('domain-active');
};

// --- Domain Expansion Logic ---
const triggerDomainExpansion = () => {
    state.isDomainActive = true;
    
    // Add burning state class to body for CSS filters/shakes
    document.body.classList.add('burning-state');
    
    // Trigger fire burn canvas simulation
    startFireBurn();
    
    // Apply camera shake animation to main content
    if (mainContent) {
        mainContent.style.animation = 'earthquake 3.0s ease-in-out';
    }
    
    // Start CSS transitions to char & fade out the main spider and pull rope
    const spider = document.querySelector('.spider');
    const rope = document.getElementById('pull-rope');
    if (spider) {
        spider.style.transition = 'transform 3.0s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 3.0s, filter 3.0s';
        spider.style.filter = 'brightness(0) sepia(1) hue-rotate(-50deg) saturate(12) drop-shadow(0 0 10px #ff3700)';
        spider.style.transform += ' scale(0) rotate(180deg)';
        spider.style.opacity = '0';
    }
    if (rope) {
        rope.style.transition = 'transform 3.0s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 3.0s, filter 3.0s';
        rope.style.filter = 'brightness(0) sepia(1) hue-rotate(-50deg) saturate(12) drop-shadow(0 0 10px #ff3700)';
        rope.style.transform = 'translateY(100px) scale(0)';
        rope.style.opacity = '0';
    }
    
    // Wait exactly 3 seconds for the burning sequence, then transition to domain video
    setTimeout(() => {
        document.body.classList.remove('burning-state');
        stopFireBurn(); // Clean up canvas & simulation elements
        
        // Hide containers completely
        const spiderContainer = document.getElementById('spider-container');
        if (spiderContainer) spiderContainer.style.display = 'none';
        if (rope) rope.style.display = 'none';
        if (mainContent) mainContent.style.animation = 'none';
        
        // 1. Play Flash Effect
        flash.classList.add('active');
        
        const domainVideo = document.getElementById('domain-video');
        
        // Combine both Domain video sound and OST music immediately
        if (domainVideo) {
            domainVideo.volume = 0.5;
            domainVideo.currentTime = 6.5; // Skip first 6.5 seconds
            
            // Error handling for the video element specifically
            domainVideo.onerror = () => {
                console.error('Video loading/playback failed');
                completeDomainTransition();
            };

            domainVideo.play().then(() => {
                // Success: Show the video
                body.classList.add('domain-video-playing');
                body.classList.remove('shrine-dimmed');
            }).catch(e => {
                console.warn('Video autoplay failed:', e);
                completeDomainTransition();
            });
            
            // Force cut the video at exactly 19 seconds
            domainVideo.ontimeupdate = () => {
                if (domainVideo.currentTime >= 19) {
                    domainVideo.pause();
                    domainVideo.ontimeupdate = null; // Prevent multiple triggers
                    completeDomainTransition();
                }
            };
            
            // Fallback in case the video ends naturally before 18.5s
            domainVideo.onended = () => {
                domainVideo.ontimeupdate = null;
                completeDomainTransition();
            };
        } else {
            setTimeout(() => {
                completeDomainTransition();
            }, 1500); 
        }
        
        // 3. Subtle camera shake entry (shrine landing)
        setTimeout(() => {
            if (mainContent) {
                mainContent.style.animation = 'cameraShake 0.5s ease-out';
            }
        }, 100);

        // 4. Cleanup flash
        setTimeout(() => {
            flash.classList.remove('active');
        }, 1500);
    }, 3000); // 3-second delay
};

// --- Startup ---
document.addEventListener('DOMContentLoaded', () => {
    initPullRope();
    initParticles();
    
    // --- Dynamic Shrine Lighting System ---
    const cards = document.querySelectorAll('.premium-app-card');
    let lightLeftBroken = false;
    let lightRightBroken = false;
    let brokenCount = 0;
    
    const updateLighting = () => {
        // The two physical post lamps at bottom corners
        const light1 = { x: window.innerWidth * 0.05, y: window.innerHeight * 0.9 };
        const light2 = { x: window.innerWidth * 0.95, y: window.innerHeight * 0.9 };
        // The Burning Sun coordinates
        const sun = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.1 };
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            // Center coordinate of the card relative to viewport
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            
            let light;
            if (brokenCount === 2) {
                // Both broken, use the Sun
                light = sun;
            } else if (lightLeftBroken) {
                // Left broken, use Right
                light = light2;
            } else if (lightRightBroken) {
                // Right broken, use Left
                light = light1;
            } else {
                // Find nearest light source
                const dist1 = Math.hypot(cardX - light1.x, cardY - light1.y);
                const dist2 = Math.hypot(cardX - light2.x, cardY - light2.y);
                light = dist1 < dist2 ? light1 : light2;
            }
            
            // Vector from light to card (shadow goes away from light)
            let dx = cardX - light.x;
            let dy = cardY - light.y;
            
            // Normalize and scale the shadow offset
            const distance = Math.max(150, Math.hypot(dx, dy));
            const maxShadowOffset = 50; // Increased to 50px shift
            
            const shadowX = (dx / distance) * maxShadowOffset;
            const shadowY = (dy / distance) * maxShadowOffset;
            
            card.style.setProperty('--shadow-x', `${shadowX}px`);
            card.style.setProperty('--shadow-y', `${shadowY}px`);
        });
    };
    
    // Physical Drag-to-Slash Interaction for Lighting
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTime = 0;

    window.addEventListener('mousedown', (e) => {
        if(state.isDragging || !state.isDomainActive) return;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTime = Date.now();
    });

    window.addEventListener('mouseup', (e) => {
        if(!state.isDomainActive) return;
        const dragEndX = e.clientX;
        const dragEndY = e.clientY;
        const dragEndTime = Date.now();
        
        const dx = dragEndX - dragStartX;
        const dy = dragEndY - dragStartY;
        const distance = Math.hypot(dx, dy);
        const timeElapsed = dragEndTime - dragStartTime;
        
        // If the drag is fast and long enough (e.g. > 150px in < 500ms)
        if (distance > 150 && timeElapsed < 500) {
            triggerSlashBreak((dragStartX + dragEndX) / 2, (dragStartY + dragEndY) / 2);
        }
    });
    
    // Touch support for slashing
    window.addEventListener('touchstart', (e) => {
        if(!state.isDomainActive || state.isDragging) return;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartTime = Date.now();
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        if(!state.isDomainActive || !e.changedTouches || e.changedTouches.length === 0) return;
        const dragEndX = e.changedTouches[0].clientX;
        const dragEndY = e.changedTouches[0].clientY;
        const dragEndTime = Date.now();
        
        const dx = dragEndX - dragStartX;
        const dy = dragEndY - dragStartY;
        const distance = Math.hypot(dx, dy);
        const timeElapsed = dragEndTime - dragStartTime;
        
        if (distance > 150 && timeElapsed < 500) {
            triggerSlashBreak((dragStartX + dragEndX) / 2, (dragStartY + dragEndY) / 2);
        }
    });

    const triggerSlashBreak = (cx, cy) => {
        if (brokenCount >= 2) return;
        
        let brokeNewLight = false;
        if (cx < window.innerWidth / 2) {
            if (!lightLeftBroken) { 
                lightLeftBroken = true; 
                brokeNewLight = true; 
                document.getElementById('target-left')?.classList.add('broken');
            }
        } else {
            if (!lightRightBroken) { 
                lightRightBroken = true; 
                brokeNewLight = true; 
                document.getElementById('target-right')?.classList.add('broken');
            }
        }
        
        if (!brokeNewLight) return;
        
        brokenCount++;
        
        // Spawn shatter shards at the slash center
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = `${cx}px`;
        container.style.top = `${cy}px`;
        container.style.zIndex = '9999';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
        
        for (let i = 0; i < 30; i++) {
            const shard = document.createElement('div');
            shard.className = 'shatter-shard';
            shard.style.background = Math.random() > 0.4 ? '#ffdf00' : '#ff1e1e';
            shard.style.position = 'absolute';
            shard.style.left = '0';
            shard.style.top = '0';
            
            const size = Math.random() * 20 + 5;
            shard.style.width = `${size}px`;
            shard.style.height = `${size}px`;
            
            const tx = (Math.random() - 0.5) * 600;
            const ty = (Math.random() - 0.2) * -600;
            const rot = (Math.random() - 0.5) * 1080;
            
            shard.style.setProperty('--tx', `${tx}px`);
            shard.style.setProperty('--ty', `${ty}px`);
            shard.style.setProperty('--rot', `${rot}deg`);
            
            container.appendChild(shard);
        }
        
        setTimeout(() => container.remove(), 2000);
        
        body.classList.remove('shadow-level-1');
        
        if (brokenCount === 2) {
            body.classList.add('pitch-black');
            setTimeout(() => {
                body.classList.remove('pitch-black');
                body.classList.add('shadow-level-2');
                body.classList.add('sun-active');
                updateLighting();
            }, 3000);
        } else {
            body.classList.add(`shadow-level-${brokenCount}`);
            updateLighting();
        }
        
        // Add a visual flash effect for the break
        const breakFlash = document.createElement('div');
        breakFlash.style.position = 'fixed';
        breakFlash.style.top = '0';
        breakFlash.style.left = '0';
        breakFlash.style.width = '100vw';
        breakFlash.style.height = '100vh';
        breakFlash.style.background = 'rgba(255, 255, 255, 0.8)';
        breakFlash.style.zIndex = '100000';
        breakFlash.style.pointerEvents = 'none';
        breakFlash.style.transition = 'opacity 0.3s ease-out';
        document.body.appendChild(breakFlash);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                breakFlash.style.opacity = '0';
                setTimeout(() => breakFlash.remove(), 300);
            });
        });
    };
    
    // Initial update and listeners
    updateLighting();
    window.addEventListener('scroll', updateLighting, { passive: true });
    window.addEventListener('resize', updateLighting, { passive: true });

    const urlParams = new URLSearchParams(window.location.search);
    const isReturning = urlParams.get('expanded') === 'true';

    if (isReturning) {
        // Skip intro and go straight to expanded state
        document.body.classList.remove('shrine-dimmed');
        document.body.classList.add('domain-active');
        state.isDomainActive = true;
        
        const spider = document.getElementById('spider-container');
        const rope = document.getElementById('pull-rope');
        if (spider) spider.style.display = 'none';
        if (rope) rope.style.display = 'none';
        

    } else {
        initInsectSimulation();
        // Cinematic Spider Animation Sequence
        setTimeout(() => {
            // Show web dialogue bubble
            const dialogueWrap = document.querySelector('.web-dialogue-wrap');
            if (dialogueWrap) {
                dialogueWrap.classList.add('show');
            }

            // Drop pulley from ceiling exactly when spider finishes interaction
            setTimeout(() => {
                const ropeContainer = document.querySelector('.pull-rope-container');
                if (ropeContainer) {
                    ropeContainer.classList.remove('hidden-pull');
                }
            }, 300); // 5000ms total spider duration
        }, 4800); 
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



