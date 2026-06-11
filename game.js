/* ==========================================================================
   YUNNAN BAIYAO BRIGHT DIAMOND WHITE PRO H5 GAME - INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM ELEMENTS
    const appContainer = document.getElementById('app-container');
    const loadingScreen = document.getElementById('screen-loading');
    const startScreen = document.getElementById('screen-start');
    const gameScreen = document.getElementById('screen-game');
    const endScreen = document.getElementById('screen-end');
    
    const loadingProgressFill = document.getElementById('loading-progress-fill');
    const loadingStatusText = document.getElementById('loading-status-text');
    
    const btnStartGame = document.getElementById('btn-start-game');
    const btnShowRules = document.getElementById('btn-show-rules');
    const btnCloseRules = document.getElementById('btn-close-rules');
    const btnRulesOk = document.getElementById('btn-rules-ok');
    const btnRestart = document.getElementById('btn-restart');
    const btnBuy = document.getElementById('btn-buy');
    const rulesModal = document.getElementById('rules-modal');
    
    // New BGM and Shop elements
    const btnToggleMusic = document.getElementById('btn-toggle-music');
    const shopModal = document.getElementById('shop-modal');
    const btnCloseShop = document.getElementById('btn-close-shop');
    const btnShopOk = document.getElementById('btn-shop-ok');
    
    const gameTimer = document.getElementById('game-timer');
    const txtWhiteness = document.getElementById('txt-whiteness');
    const txtHealth = document.getElementById('txt-health');
    const barWhiteness = document.getElementById('bar-whiteness');
    const barHealth = document.getElementById('bar-health');
    const barScent = document.getElementById('bar-scent');
    const dynamicHintText = document.getElementById('dynamic-hint-text');
    const gameTutorial = document.getElementById('game-tutorial');
    const popupNotifications = document.getElementById('popup-notifications');
    
    const endWhitenessLevel = document.getElementById('end-whiteness-level');
    const endHealthBar = document.getElementById('end-health-bar');
    const endHealthValue = document.getElementById('end-health-value');
    const endScentBar = document.getElementById('end-scent-bar');
    const endScentValue = document.getElementById('end-scent-value');
    const endDesignation = document.getElementById('end-designation');
    
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // 2. GAME PARAMETERS & STATE
    let gameState = 'loading'; // loading, start, playing, ended
    let timeLeft = 15; // 15 seconds
    let gameInterval = null;
    let timerStarted = false;
    let whitenessScore = 0; // 0 to 100
    let healthScore = 50;   // Starts at 50%, goes to 100%
    let scentScore = 20;    // Starts at 20%, goes to 100%
    
    let pointer = { x: 0, y: 0, prevX: 0, prevY: 0, isDown: false, active: false };
    let tutorialDismissed = false;
    let animationFrameId = null;
    
    // Game elements arrays
    let teeth = [];
    let gumNodes = [];
    let flowers = [];
    let particles = [];
    let floatingPetals = [];
    
    // Toothbrush state
    let brushAngle = -Math.PI / 6;
    let brushScale = 1;
    let lastFoamTime = 0;

    // Brand Copy/Hints rotating bank
    const hintMessages = [
        "正在使用【3抗美白配方】高效瓦解外源性牙渍...",
        "云南白药活性提取物释放中，温和修护口腔黏膜...",
        "清爽提神的椒样薄荷与留兰中调散发，口气倍感清凉...",
        "正在抑制牙结石与牙菌斑堆积，3天亮白10个色阶...",
        "雪沁山茶香氛已分层释放：清冽淡雅的山茶前调...",
        "帮助修护红肿、减轻牙龈出血，口腔健康有保障...",
        "温润高级的冰岛白茶与天竺葵后调，持久芬芳治愈..."
    ];
    let currentHintIndex = 0;
    let hintTimer = null;

    // 3. BACKGROUND FALLING PETALS CREATOR
    function initBackgroundPetals() {
        const container = document.getElementById('bg-petals');
        container.innerHTML = '';
        const petalCount = 12;
        for (let i = 0; i < petalCount; i++) {
            createPetal(container, true);
        }
    }

    function createPetal(container, init = false) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        const size = Math.random() * 8 + 8;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 8 + 6;
        const delay = init ? -Math.random() * duration : 0;
        petal.style.animationDuration = `${duration}s`;
        if (delay) petal.style.animationDelay = `${delay}s`;
        
        // Random petal shape variation
        petal.style.borderRadius = '50% 0 50% 50%';
        petal.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        container.appendChild(petal);
        
        // Remove and replace after animation completes
        setTimeout(() => {
            if (petal.parentNode === container) {
                petal.remove();
                createPetal(container, false);
            }
        }, (duration + delay) * 1000);
    }

    // 4. SCREEN ROUTING
    function showScreen(screen) {
        // Deactivate all screens
        [loadingScreen, startScreen, gameScreen, endScreen].forEach(s => {
            s.classList.remove('active');
        });
        // Activate requested screen
        screen.classList.add('active');
        
        // Trigger screen-specific initializers
        if (screen === startScreen) {
            gameState = 'start';
            initBackgroundPetals();
        } else if (screen === gameScreen) {
            gameState = 'playing';
            startGame();
        } else if (screen === endScreen) {
            gameState = 'ended';
            stopGame();
            showResults();
        }
    }

    // 5. LOADING ANIMATION (MOCK RESOURCE LOADING)
    function runLoader() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                loadingStatusText.textContent = "光钻白PRO，闪耀就绪！";
                setTimeout(() => {
                    showScreen(startScreen);
                }, 600);
            }
            loadingProgressFill.style.width = `${progress}%`;
            
            // Update loading text periodically
            if (progress < 30) {
                loadingStatusText.textContent = "药理科技融合中...";
            } else if (progress < 60) {
                loadingStatusText.textContent = "调配雪沁山茶香氛中...";
            } else if (progress < 85) {
                loadingStatusText.textContent = "载入3抗美白因子...";
            } else {
                loadingStatusText.textContent = "正在生成牙齿模型...";
            }
        }, 100);
    }
    
    // Run loader immediately
    runLoader();

    // 6. EVENT BINDINGS
    btnStartGame.addEventListener('click', () => {
        showScreen(gameScreen);
    });

    btnShowRules.addEventListener('click', () => {
        rulesModal.classList.add('active');
    });

    btnCloseRules.addEventListener('click', () => {
        rulesModal.classList.remove('active');
    });

    btnRulesOk.addEventListener('click', () => {
        rulesModal.classList.remove('active');
    });

    btnRestart.addEventListener('click', () => {
        showScreen(gameScreen);
    });

    btnBuy.addEventListener('click', () => {
        // Open WeChat Shop QR Code Modal instead of external URL link
        shopModal.classList.add('active');
    });

    btnCloseShop.addEventListener('click', () => {
        shopModal.classList.remove('active');
    });

    btnShopOk.addEventListener('click', () => {
        shopModal.classList.remove('active');
    });

    // Close modals on clicking overlay background
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.classList.remove('active');
        }
    });

    shopModal.addEventListener('click', (e) => {
        if (e.target === shopModal) {
            shopModal.classList.remove('active');
        }
    });

    // 7. GAME ENGINE & LOGIC
    
    // Resize Canvas keeping High DPI Sharpness
    function resizeCanvas() {
        const rect = canvas.parentNode.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Update client-space sizes
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    // Initialize Game Elements
    function initGameElements() {
        teeth = [];
        gumNodes = [];
        flowers = [];
        particles = [];
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        const centerX = w / 2;
        const centerY = h / 2 - 10;
        
        // Define clean curved layouts for teeth
        // 6 Top teeth (arch pointing upwards)
        const topTeethAngles = [-2.4, -2.1, -1.8, -1.34, -1.04, -0.74]; // radians
        const radiusX = w * 0.32;
        const radiusY = h * 0.16;
        
        // Teeth properties
        const topToothPositions = [
            { id: 1, angle: -2.3, w: 25, h: 36, isTop: true, label: "Molar" },
            { id: 2, angle: -1.95, w: 28, h: 42, isTop: true, label: "Premolar" },
            { id: 3, angle: -1.7, w: 32, h: 46, isTop: true, label: "Incisor" },
            { id: 4, angle: -1.44, w: 32, h: 46, isTop: true, label: "Incisor" },
            { id: 5, angle: -1.19, w: 28, h: 42, isTop: true, label: "Premolar" },
            { id: 6, angle: -0.84, w: 25, h: 36, isTop: true, label: "Molar" }
        ];

        topToothPositions.forEach(tp => {
            const tx = centerX + Math.cos(tp.angle) * radiusX;
            const ty = centerY + Math.sin(tp.angle) * radiusY - 25;
            
            // Stains list
            const stains = [];
            const stainCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 stains
            for (let i = 0; i < stainCount; i++) {
                stains.push({
                    rx: (Math.random() - 0.5) * (tp.w - 10),
                    ry: (Math.random() - 0.5) * (tp.h - 10),
                    size: Math.random() * 6 + 4,
                    color: Math.random() > 0.5 ? 'rgba(139, 90, 43, 0.85)' : 'rgba(218, 165, 32, 0.9)', // Brown/Yellow
                    opacity: 1
                });
            }

            teeth.push({
                id: tp.id,
                x: tx,
                y: ty,
                w: tp.w,
                h: tp.h,
                angle: tp.angle + Math.PI/2,
                isTop: true,
                cleanliness: 0, // Starts at 0%
                stains: stains
            });
        });

        // 6 Bottom teeth (arch pointing downwards)
        const bottomToothPositions = [
            { id: 7, angle: -2.3, w: 24, h: 32, isTop: false, label: "Molar" },
            { id: 8, angle: -1.95, w: 26, h: 38, isTop: false, label: "Premolar" },
            { id: 9, angle: -1.7, w: 30, h: 42, isTop: false, label: "Incisor" },
            { id: 10, angle: -1.44, w: 30, h: 42, isTop: false, label: "Incisor" },
            { id: 11, angle: -1.19, w: 26, h: 38, isTop: false, label: "Premolar" },
            { id: 12, angle: -0.84, w: 24, h: 32, isTop: false, label: "Molar" }
        ];

        bottomToothPositions.forEach(tp => {
            // Lower them down slightly
            const tx = centerX + Math.cos(tp.angle) * radiusX;
            const ty = centerY - Math.sin(tp.angle) * radiusY + 35;
            
            // Stains list
            const stains = [];
            const stainCount = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < stainCount; i++) {
                stains.push({
                    rx: (Math.random() - 0.5) * (tp.w - 10),
                    ry: (Math.random() - 0.5) * (tp.h - 10),
                    size: Math.random() * 6 + 4,
                    color: Math.random() > 0.5 ? 'rgba(139, 90, 43, 0.85)' : 'rgba(218, 165, 32, 0.9)',
                    opacity: 1
                });
            }

            teeth.push({
                id: tp.id,
                x: tx,
                y: ty,
                w: tp.w,
                h: tp.h,
                angle: -tp.angle - Math.PI/2,
                isTop: false,
                cleanliness: 0,
                stains: stains
            });
        });

        // Initialize 4 Swollen Bleeding Gums locations
        // 2 on top gums, 2 on bottom gums
        const topGumsY = centerY - 75;
        const bottomGumsY = centerY + 85;
        
        gumNodes = [
            { id: 101, x: centerX - 80, y: topGumsY + 5, r: 16, currentRed: 1, active: true, label: "牙龈出血" },
            { id: 102, x: centerX + 70, y: topGumsY + 12, r: 16, currentRed: 1, active: true, label: "黏膜红肿" },
            { id: 103, x: centerX - 60, y: bottomGumsY - 10, r: 16, currentRed: 1, active: true, label: "牙龈肿痛" },
            { id: 104, x: centerX + 50, y: bottomGumsY - 2, r: 16, currentRed: 1, active: true, label: "食物刺激红肿" }
        ];

        // Trigger first flower spawn quickly
        spawnCamelliaFlower();
    }

    function spawnCamelliaFlower() {
        if (gameState !== 'playing') return;
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        flowers.push({
            x: Math.random() * (w - 60) + 30,
            y: h + 30,
            r: 22,
            speedY: Math.random() * 1.2 + 0.8,
            speedX: Math.sin(Math.random() * Math.PI) * 0.5,
            wiggleScale: Math.random() * 10 + 5,
            wiggleSpeed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * 100,
            opacity: 1,
            active: true
        });

        // Schedule next flower spawn
        const nextTime = Math.random() * 3000 + 2500; // spawn every 2.5 - 5.5s
        setTimeout(spawnCamelliaFlower, nextTime);
    }

    // Setup timer count-down interval only when brushing starts
    function startCountdown() {
        if (timerStarted) return;
        timerStarted = true;
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                timeLeft = 0;
                showScreen(endScreen);
            }
            gameTimer.textContent = `${timeLeft}s`;
            if (timeLeft <= 10) {
                gameTimer.classList.add('highlight');
            }
        }, 1000);
    }

    // Start Game Loops
    function startGame() {
        timeLeft = 15;
        timerStarted = false;
        whitenessScore = 0;
        healthScore = 50;
        scentScore = 20;
        tutorialDismissed = false;
        
        gameTimer.textContent = `${timeLeft}s`;
        gameTimer.classList.remove('highlight');
        txtWhiteness.textContent = '0%';
        txtHealth.textContent = '50%';
        barWhiteness.style.width = '0%';
        barHealth.style.width = '50%';
        barScent.style.width = '20%';
        gameTutorial.classList.remove('hidden');
        
        // Settle layouts and structures
        resizeCanvas();
        initGameElements();
        
        if (gameInterval) clearInterval(gameInterval);

        // Start hint messages cycling
        currentHintIndex = 0;
        dynamicHintText.textContent = hintMessages[0];
        if (hintTimer) clearInterval(hintTimer);
        hintTimer = setInterval(() => {
            currentHintIndex = (currentHintIndex + 1) % hintMessages.length;
            dynamicHintText.textContent = hintMessages[currentHintIndex];
        }, 4000);

        // Setup pointer position defaults
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        pointer.x = w / 2;
        pointer.y = h / 2 + 100;
        pointer.isDown = false;
        pointer.active = false;

        // Kick off main engine loop
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        tick();
    }

    function stopGame() {
        if (gameInterval) clearInterval(gameInterval);
        if (hintTimer) clearInterval(hintTimer);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }

    // Game loop tick
    function tick() {
        update();
        render();
        animationFrameId = requestAnimationFrame(tick);
    }

    // 8. UPDATE SYSTEM
    function update() {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        // Dismiss tutorial and start countdown on first brush action
        if (pointer.isDown) {
            if (!tutorialDismissed) {
                tutorialDismissed = true;
                gameTutorial.classList.add('hidden');
            }
            if (!timerStarted) {
                startCountdown();
            }
        }

        // Adjust Toothbrush Angle for brush dynamics
        if (pointer.isDown) {
            const dx = pointer.x - pointer.prevX;
            // Smoothly swing brush left/right
            const targetAngle = dx > 1 ? -Math.PI/12 : (dx < -1 ? -Math.PI/4 : -Math.PI/6);
            brushAngle += (targetAngle - brushAngle) * 0.15;
            brushScale = 1.1; // expand slightly when pressing
        } else {
            brushAngle += (-Math.PI/6 - brushAngle) * 0.1;
            brushScale += (1.0 - brushScale) * 0.1;
        }

        // 8a. Collision / Cleaning Check
        if (pointer.isDown) {
            const brushRadius = 24;
            
            // Check Tooth Stains Cleaned
            teeth.forEach(t => {
                let dist = Math.hypot(pointer.x - t.x, pointer.y - t.y);
                if (dist < brushRadius + Math.max(t.w, t.h)/2) {
                    
                    let stainsCleanedThisFrame = false;
                    
                    // Erase stains
                    t.stains.forEach(s => {
                        if (s.opacity > 0) {
                            // Calculate stain global coordinate
                            // Accounts for tooth rotation
                            const cosAngle = Math.cos(t.angle);
                            const sinAngle = Math.sin(t.angle);
                            const sx = t.x + (s.rx * cosAngle - s.ry * sinAngle);
                            const sy = t.y + (s.rx * sinAngle + s.ry * cosAngle);
                            
                            const sDist = Math.hypot(pointer.x - sx, pointer.y - sy);
                            if (sDist < brushRadius + s.size) {
                                s.opacity -= 0.08; // clean rate
                                if (s.opacity <= 0) {
                                    s.opacity = 0;
                                    // Sparkly white stars spawned
                                    createParticle(sx, sy, 'star');
                                    stainsCleanedThisFrame = true;
                                }
                            }
                        }
                    });

                    // Update tooth cleanliness
                    const activeStains = t.stains.filter(s => s.opacity > 0);
                    const totalStains = t.stains.length;
                    const prevClean = t.cleanliness;
                    
                    t.cleanliness = 1 - (activeStains.length / totalStains);
                    
                    // If newly fully cleaned, award big starburst!
                    if (t.cleanliness === 1 && prevClean < 1) {
                        for (let k = 0; k < 8; k++) {
                            createParticle(t.x, t.y, 'star');
                        }
                        createFloatingText(t.x, t.y - 20, "✨ 3抗美白!", "#66ccff");
                        showNotification("3抗祛渍因子已阻断外源牙渍！", "💎", 2000);
                    }

                    // Create foam bubbles while brushing
                    const now = Date.now();
                    if (now - lastFoamTime > 60) {
                        createParticle(pointer.x, pointer.y, 'bubble');
                        lastFoamTime = now;
                    }
                }
            });

            // Check Gums Healed
            gumNodes.forEach(gn => {
                if (gn.active) {
                    let dist = Math.hypot(pointer.x - gn.x, pointer.y - gn.y);
                    if (dist < brushRadius + gn.r) {
                        gn.currentRed -= 0.015; // heal speed
                        
                        // Bubble healing particles
                        if (Math.random() < 0.2) {
                            createParticle(gn.x + (Math.random()-0.5)*15, gn.y + (Math.random()-0.5)*15, 'shield');
                        }

                        if (gn.currentRed <= 0) {
                            gn.currentRed = 0;
                            gn.active = false;
                            
                            // Healed! Trigger splash
                            for (let k = 0; k < 12; k++) {
                                createParticle(gn.x, gn.y, 'shield');
                            }
                            createFloatingText(gn.x, gn.y - 20, "🛡️ 护口有方!", "#33cc88");
                            
                            // Increase health score
                            healthScore = Math.min(100, healthScore + 15);
                            txtHealth.textContent = `${Math.floor(healthScore)}%`;
                            barHealth.style.width = `${healthScore}%`;
                            
                            showNotification("白药提取物起效，红肿消褪！", "🛡️", 2000);
                        }
                    }
                }
            });
        }

        // 8b. Update Floating Camellias & Check clicks/brushes
        flowers.forEach(f => {
            if (f.active) {
                // Update position
                f.y -= f.speedY;
                f.phase += f.wiggleSpeed;
                f.x += Math.sin(f.phase) * 0.4;
                
                // Keep inside bounds
                if (f.y < -30) {
                    f.active = false;
                }
                
                // Collision with toothbrush
                const distToBrush = Math.hypot(pointer.x - f.x, pointer.y - f.y);
                const isBrushed = distToBrush < f.r + 20;
                
                if (isBrushed && f.opacity > 0) {
                    popFlower(f);
                }
            }
        });
        
        // Filter out dead flowers
        flowers = flowers.filter(f => f.active);

        // 8c. Particle updates
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.fade;
            p.rotation += p.rotSpeed;
            if (p.alpha <= 0) p.alpha = 0;
        });
        particles = particles.filter(p => p.alpha > 0);

        // 8d. Calculate Whitening Score dynamically
        let totalCleanRatio = 0;
        teeth.forEach(t => {
            totalCleanRatio += t.cleanliness;
        });
        whitenessScore = Math.floor((totalCleanRatio / teeth.length) * 100);
        
        txtWhiteness.textContent = `${whitenessScore}%`;
        barWhiteness.style.width = `${whitenessScore}%`;

        // Update pointer previous coordinates
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
    }

    // Popping Camellia Flower - Fragrance Bomb
    function popFlower(f) {
        f.active = false;
        
        // Spawn gorgeous pink flower particle blast
        for (let i = 0; i < 20; i++) {
            createParticle(f.x, f.y, 'petal');
        }
        
        createFloatingText(f.x, f.y - 25, "🌸 雪沁山茶!", "#ff80b3");
        
        // Scent progress bar bump
        scentScore = Math.min(100, scentScore + 20);
        barScent.style.width = `${scentScore}%`;

        // Gameplay benefit: clear a random stained tooth immediately
        let stainedTeeth = teeth.filter(t => t.cleanliness < 1);
        if (stainedTeeth.length > 0) {
            // Grab a random dirty tooth and cleanse it!
            const luckyTooth = stainedTeeth[Math.floor(Math.random() * stainedTeeth.length)];
            luckyTooth.stains.forEach(s => { s.opacity = 0; });
            luckyTooth.cleanliness = 1;
            
            for (let k = 0; k < 10; k++) {
                createParticle(luckyTooth.x, luckyTooth.y, 'star');
            }
            createFloatingText(luckyTooth.x, luckyTooth.y - 15, "✨ 净化!", "#ffffff");
        }
        
        showNotification("雪沁香氛绽放！瓦解牙渍并治愈红肿", "🌸", 2000);
        
        // Gum healing assist (20% heal to all active nodes)
        gumNodes.forEach(gn => {
            if (gn.active) {
                gn.currentRed = Math.max(0, gn.currentRed - 0.25);
                if (gn.currentRed <= 0) {
                    gn.currentRed = 0;
                    gn.active = false;
                    for (let k = 0; k < 6; k++) createParticle(gn.x, gn.y, 'shield');
                    createFloatingText(gn.x, gn.y - 20, "🛡️ 已修复", "#33cc88");
                    healthScore = Math.min(100, healthScore + 15);
                    txtHealth.textContent = `${Math.floor(healthScore)}%`;
                    barHealth.style.width = `${healthScore}%`;
                }
            }
        });
    }

    // 9. PARTICLE SYSTEM INITIALIZER
    function createParticle(x, y, type) {
        let p = {
            x: x,
            y: y,
            type: type,
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1
        };

        if (type === 'bubble') { // Brushing bubbles
            p.r = Math.random() * 5 + 3;
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = (Math.random() - 0.5) * 2 - 1.5;
            p.fade = Math.random() * 0.03 + 0.02;
            p.color = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.8)' : 
                      (Math.random() > 0.5 ? 'rgba(0, 180, 200, 0.4)' : 'rgba(255, 102, 178, 0.4)');
        } 
        else if (type === 'star') { // Brightening stars
            p.size = Math.random() * 6 + 4;
            p.vx = (Math.random() - 0.5) * 4;
            p.vy = (Math.random() - 0.5) * 4;
            p.fade = Math.random() * 0.02 + 0.015;
            p.color = Math.random() > 0.5 ? '#66e0ff' : '#ffffff';
        }
        else if (type === 'shield') { // Healing shields
            p.size = Math.random() * 8 + 6;
            p.vx = (Math.random() - 0.5) * 3;
            p.vy = (Math.random() - 0.5) * 3 - 0.5;
            p.fade = Math.random() * 0.03 + 0.015;
            p.color = '#33ffaa';
        }
        else if (type === 'petal') { // Camellia fragrance petals
            p.size = Math.random() * 10 + 6;
            p.vx = (Math.random() - 0.5) * 5;
            p.vy = (Math.random() - 0.5) * 5 - 2;
            p.fade = Math.random() * 0.02 + 0.01;
            p.color = Math.random() > 0.6 ? '#ffffff' : '#ff99cc';
        }

        particles.push(p);
    }

    // On-screen floating scoring cues
    function createFloatingText(x, y, text, color) {
        const div = document.createElement('div');
        div.className = 'popup-note';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.color = color;
        div.innerText = text;
        
        popupNotifications.appendChild(div);
        
        setTimeout(() => {
            div.remove();
        }, 1000);
    }

    // Top-Center micro notifications
    function showNotification(text, icon, duration = 2000) {
        // We can print this in the product hint description dynamically
        dynamicHintText.innerHTML = `<span style="font-size:14px; margin-right:5px;">${icon}</span> <strong>${text}</strong>`;
        
        // Reset to cyclic tip bank after duration
        if (hintTimer) clearInterval(hintTimer);
        hintTimer = setInterval(() => {
            currentHintIndex = (currentHintIndex + 1) % hintMessages.length;
            dynamicHintText.textContent = hintMessages[currentHintIndex];
        }, 4000);
    }

    // 10. RENDER ENGINE (CANVAS DRAWING)
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        const centerX = w / 2;
        const centerY = h / 2 - 10;

        // 10a. Draw Mouth Cavity (Dark background circle/ellipse)
        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.fillStyle = '#180a0f'; // Dark maroon/blood shade
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, w * 0.38, h * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw inside throat (Dark central shadow)
        ctx.fillStyle = '#0a0306';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, w * 0.20, h * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        // 10b. Draw Teeth & Gums
        // We draw gums first as custom filled shapes back of teeth
        drawGumsBacking(centerX, centerY, w, h);

        // Draw individual teeth
        teeth.forEach(t => {
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.angle);
            
            // Draw single tooth base (Yellowish under-layer)
            ctx.fillStyle = '#edd1a1'; // Yellow tooth stain background
            ctx.beginPath();
            drawRoundRectPath(ctx, -t.w/2, -t.h/2, t.w, t.h, 6);
            ctx.fill();
            
            // Draw shiny clean overlay based on cleanliness ratio
            ctx.globalAlpha = t.cleanliness;
            const teethGradient = ctx.createLinearGradient(-t.w/2, -t.h/2, t.w/2, t.h/2);
            teethGradient.addColorStop(0, '#ffffff');
            teethGradient.addColorStop(0.5, '#e6f7ff'); // light ice blue
            teethGradient.addColorStop(1, '#ffffff');
            ctx.fillStyle = teethGradient;
            ctx.beginPath();
            drawRoundRectPath(ctx, -t.w/2, -t.h/2, t.w, t.h, 6);
            ctx.fill();
            
            // Clean tooth shines/streaks (diagonal reflection)
            if (t.cleanliness > 0.7) {
                ctx.globalAlpha = (t.cleanliness - 0.7) * 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-t.w/4, -t.h/2 + 6);
                ctx.lineTo(t.w/2 - 6, t.h/4);
                ctx.stroke();
            }
            
            ctx.restore();
            
            // Draw Stains on top (in global coordinates to prevent complex clipping)
            ctx.save();
            t.stains.forEach(s => {
                if (s.opacity > 0) {
                    ctx.globalAlpha = s.opacity;
                    ctx.fillStyle = s.color;
                    
                    // Rotate stain position relative to tooth
                    const cosAngle = Math.cos(t.angle);
                    const sinAngle = Math.sin(t.angle);
                    const sx = t.x + (s.rx * cosAngle - s.ry * sinAngle);
                    const sy = t.y + (s.rx * sinAngle + s.ry * cosAngle);
                    
                    ctx.beginPath();
                    ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            ctx.restore();
        });

        // 10c. Draw Swollen/Bleeding Gum Nodes
        gumNodes.forEach(gn => {
            if (gn.currentRed > 0) {
                ctx.save();
                
                // Inflamed pulsing red ring
                const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.15;
                const rad = gn.r * pulse;
                
                ctx.globalAlpha = gn.currentRed * 0.7;
                
                const grad = ctx.createRadialGradient(gn.x, gn.y, 2, gn.x, gn.y, rad);
                grad.addColorStop(0, 'rgba(255, 30, 80, 0.9)');
                grad.addColorStop(0.5, 'rgba(255, 10, 50, 0.4)');
                grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(gn.x, gn.y, rad, 0, Math.PI * 2);
                ctx.fill();

                // Small center blood indicator
                ctx.globalAlpha = gn.currentRed;
                ctx.fillStyle = '#ff1a40';
                ctx.beginPath();
                ctx.arc(gn.x, gn.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Overlay text tag
                ctx.fillStyle = '#ffb3c1';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(gn.label, gn.x, gn.y - 12);
                
                ctx.restore();
            }
        });

        // 10d. Draw Floating Camellia Flowers
        flowers.forEach(f => {
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.globalAlpha = f.opacity;
            
            // Draw Camellia blossom
            drawCamelliaFlowerSvg(ctx, f.r);
            
            ctx.restore();
        });

        // 10e. Draw Particles
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;

            if (p.type === 'bubble') {
                ctx.beginPath();
                ctx.arc(0, 0, p.r, 0, Math.PI * 2);
                ctx.fill();
                // Bubble shine dot
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(-p.r/3, -p.r/3, p.r/5, 0, Math.PI * 2);
                ctx.fill();
            } 
            else if (p.type === 'star') {
                // Draw a 4-point spark star
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.lineTo(0, -p.size);
                    ctx.rotate(Math.PI / 2);
                }
                ctx.closePath();
                ctx.fill();
            }
            else if (p.type === 'shield') {
                // Draw a small cross or shield circle
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-3, 0); ctx.lineTo(3, 0);
                ctx.moveTo(0, -3); ctx.lineTo(0, 3);
                ctx.stroke();
            }
            else if (p.type === 'petal') {
                // Draw heart/petal shape
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-p.size/2, -p.size/2, -p.size, p.size/3, 0, p.size);
                ctx.bezierCurveTo(p.size, p.size/3, p.size/2, -p.size/2, 0, 0);
                ctx.fill();
            }

            ctx.restore();
        });

        // 10f. Draw Toothbrush Cursor Tool
        if (pointer.active || pointer.isDown) {
            ctx.save();
            ctx.translate(pointer.x, pointer.y);
            ctx.rotate(brushAngle);
            ctx.scale(brushScale, brushScale);
            
            // Draw Brush Handle (Frosted Cyan Glass)
            ctx.fillStyle = 'rgba(0, 180, 200, 0.4)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            
            // Brush head path
            ctx.beginPath();
            drawRoundRectPath(ctx, -14, -40, 28, 50, 8);
            ctx.fill();
            ctx.stroke();
            
            // Handle extension
            ctx.fillStyle = 'rgba(0, 150, 180, 0.3)';
            ctx.beginPath();
            drawRoundRectPath(ctx, -6, 10, 12, 100, 4);
            ctx.fill();
            ctx.stroke();
            
            // Draw Brush Bristles (White lines)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            drawRoundRectPath(ctx, -10, -35, 20, 40, 4);
            ctx.fill();
            
            // Bristle separator lines
            ctx.strokeStyle = '#e6f7ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = -30; i <= 0; i += 8) {
                ctx.moveTo(-10, i);
                ctx.lineTo(10, i);
            }
            ctx.stroke();
            
            // Draw Yunnan Baiyao Toothpaste Dollop! (Dual-color gel: Sparkling Cyan + Camellia Pink)
            ctx.shadowBlur = 4;
            // Cyan gel
            ctx.fillStyle = '#00f2fe';
            ctx.beginPath();
            ctx.arc(-4, -22, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Pink gel
            ctx.fillStyle = '#ff007f';
            ctx.beginPath();
            ctx.arc(4, -18, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Whitening glowing star on toothpaste dollop
            ctx.fillStyle = '#ffffff';
            ctx.save();
            ctx.translate(0, -20);
            ctx.rotate(Date.now() * 0.002);
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                ctx.lineTo(0, -6);
                ctx.rotate(Math.PI / 2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.restore();
        }
    }

    // Helper: Rounded Rectangle Path
    function drawRoundRectPath(context, x, y, width, height, radius) {
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
    }

    // Helper: Gum curve silhouettes
    function drawGumsBacking(centerX, centerY, w, h) {
        ctx.save();
        ctx.fillStyle = '#df526a'; // Natural healthy gum pink/red
        
        // Top gums backing arch
        ctx.beginPath();
        ctx.arc(centerX, centerY - 65, w * 0.32, Math.PI, 0, false);
        ctx.lineTo(centerX + w * 0.32, centerY - 85);
        ctx.arc(centerX, centerY - 85, w * 0.32, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Bottom gums backing arch
        ctx.beginPath();
        ctx.arc(centerX, centerY + 65, w * 0.32, 0, Math.PI, false);
        ctx.lineTo(centerX - w * 0.32, centerY + 85);
        ctx.arc(centerX, centerY + 85, w * 0.32, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    // Helper: Procedural Camellia Flower shape
    function drawCamelliaFlowerSvg(context, r) {
        // Draw 5 flower petals
        context.fillStyle = '#ffccd9';
        context.strokeStyle = '#ff3385';
        context.lineWidth = 1.5;
        
        // Radial petals
        for (let i = 0; i < 5; i++) {
            context.beginPath();
            context.ellipse(0, -r * 0.6, r * 0.5, r * 0.6, 0, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.rotate((Math.PI * 2) / 5);
        }
        
        // Inner white petal layers for luxury feel
        context.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            context.beginPath();
            context.ellipse(0, -r * 0.4, r * 0.3, r * 0.4, 0, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.rotate((Math.PI * 2) / 5);
        }

        // Flower golden heart (pistils)
        context.fillStyle = '#ffcc00';
        context.beginPath();
        context.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        context.fill();
        
        // Inner detail seeds
        context.fillStyle = '#e69900';
        for (let k = 0; k < 6; k++) {
            context.beginPath();
            const angle = (Math.PI * 2) / 6 * k;
            context.arc(Math.cos(angle) * (r * 0.12), Math.sin(angle) * (r * 0.12), 2, 0, Math.PI * 2);
            context.fill();
        }
    }

    // 11. END SCREEN RESULTS CALCULATION & INCENTIVE SETUP
    function showResults() {
        // Cap/calculate end grades
        const finalWhiteness = whitenessScore;
        const finalHealth = healthScore;
        const finalScent = scentScore;

        // Whitening level display (3 days, 10 shades target)
        // Map 0-100 cleanliness to 0-10 whitening shades
        const shadesHealed = Math.min(10, Math.ceil((finalWhiteness / 100) * 10));
        endWhitenessLevel.textContent = shadesHealed;
        
        // Health Progress Fill
        endHealthBar.style.width = `${finalHealth}%`;
        endHealthValue.textContent = `${finalHealth}%`;
        
        // Scent Progress Fill
        endScentBar.style.width = `${finalScent}%`;
        endScentValue.textContent = `${finalScent}%`;

        // Set Title/Designation based on accomplishments
        let designation = "✨ 钻白闪耀守护官 ✨";
        if (finalWhiteness >= 90 && finalHealth >= 90) {
            designation = "🏆 钻白修复大满贯 🏆";
        } else if (finalWhiteness >= 85) {
            designation = "💎 钻白美齿闪耀达人 💎";
        } else if (finalHealth >= 85) {
            designation = "🛡️ 云端御齿护口官 🛡️";
        } else if (finalScent >= 80) {
            designation = "🌸 雪沁山茶香氛使者 🌸";
        } else {
            designation = "🦷 元气洁齿练习生 🦷";
        }
        endDesignation.textContent = designation;
    }

    // 12. POINTER / INTERACTION EVENT LISTENERS
    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        
        // Touch supports
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function handlePointerDown(e) {
        if (gameState !== 'playing') return;
        
        // Prevent default scrolling on touches
        if (e.cancelable) e.preventDefault();
        
        const pos = getPointerPos(e);
        pointer.x = pos.x;
        pointer.y = pos.y;
        pointer.prevX = pos.x;
        pointer.prevY = pos.y;
        pointer.isDown = true;
        pointer.active = true;
        
        // Check if clicked directly on a flower
        flowers.forEach(f => {
            const dist = Math.hypot(pointer.x - f.x, pointer.y - f.y);
            if (dist < f.r + 15) {
                popFlower(f);
            }
        });
    }

    function handlePointerMove(e) {
        if (gameState !== 'playing') return;
        if (e.cancelable) e.preventDefault();
        
        const pos = getPointerPos(e);
        pointer.x = pos.x;
        pointer.y = pos.y;
        pointer.active = true;
    }

    function handlePointerUp() {
        pointer.isDown = false;
    }

    function handlePointerLeave() {
        pointer.isDown = false;
        pointer.active = false;
    }

    // Mouse Listeners
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerLeave);

    // Touch Listeners
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    canvas.addEventListener('touchcancel', handlePointerUp);

    // ==========================================================================
    // AUDIO SYNTHESIZER & BGM LOGIC
    // ==========================================================================

    class BgmSynth {
        constructor() {
            this.ctx = null;
            this.isPlaying = false;
            this.notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25]; // C major pentatonic
            this.chords = [
                [130.81, 196.00, 329.63], // C major (C3-G3-E4)
                [146.83, 220.00, 349.23], // D minor (D3-A3-F4)
                [164.81, 246.94, 392.00], // E minor (E3-B3-G4)
                [174.61, 261.63, 440.00]  // F major (F3-C4-A4)
            ];
            this.currentChord = 0;
            this.interval = null;
        }
        
        start() {
            if (this.isPlaying) return;
            
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                }
            } catch(e) {
                console.error("Web Audio API not supported", e);
                return;
            }
            
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            
            this.isPlaying = true;
            
            let step = 0;
            this.interval = setInterval(() => {
                if (!this.isPlaying || !this.ctx) return;
                const time = this.ctx.currentTime;
                
                // Arpeggiate chord notes smoothly
                if (step % 2 === 0) {
                    const chord = this.chords[this.currentChord];
                    const baseNote = chord[Math.floor(Math.random() * chord.length)];
                    // Pitch arpeggio octave scaling
                    const note = baseNote * (Math.random() > 0.6 ? 2 : 1);
                    this.playNote(note, time, 1.6);
                }
                
                // Switch base chord harmonies every 8 beats
                if (step % 8 === 0) {
                    this.currentChord = (this.currentChord + 1) % this.chords.length;
                    // Gentle base grounding tone
                    this.playNote(this.chords[this.currentChord][0] / 2, time, 3.2, 0.04);
                }
                
                step++;
            }, 800);
        }
        
        playNote(freq, startTime, duration, vol = 0.02) {
            if (!this.ctx) return;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            
            // Soft ADSR envelope
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + 0.3); // Slow attack
            gain.gain.setValueAtTime(vol, startTime + duration - 0.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Soft release
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        }
        
        stop() {
            this.isPlaying = false;
            if (this.interval) clearInterval(this.interval);
        }
    }

    class MusicManager {
        constructor() {
            this.synth = new BgmSynth();
            this.audio = new Audio();
            this.audio.src = '如果忧郁是天赋_Music - 半故「前奏」.mp3';
            this.audio.loop = true;
            this.useAudio = true; // Default to true to prioritize local MP3 file
            this.isPlaying = false;
            
            // Fallback to synth if there is an error loading the MP3
            this.audio.addEventListener('error', () => {
                this.useAudio = false;
                if (this.isPlaying) {
                    this.synth.start();
                }
            });
        }
        
        play() {
            this.isPlaying = true;
            if (this.useAudio) {
                this.audio.play().catch((err) => {
                    console.log("Audio autoplay blocked, waiting for user gesture:", err);
                });
            } else {
                this.synth.start();
            }
        }
        
        pause() {
            this.isPlaying = false;
            if (this.useAudio) {
                this.audio.pause();
            }
            this.synth.stop();
        }
    }

    const musicManager = new MusicManager();
    let musicEnabled = true;

    // Toggle Music Button Click Handler
    btnToggleMusic.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering double click on window listener
        musicEnabled = !musicEnabled;
        if (musicEnabled) {
            musicManager.play();
            btnToggleMusic.classList.add('active');
        } else {
            musicManager.pause();
            btnToggleMusic.classList.remove('active');
        }
    });

    // WeChat browser autoplay support using WeixinJSBridge
    const startWechatBgm = () => {
        if (musicEnabled && !musicManager.isPlaying) {
            musicManager.play();
        }
    };

    if (window.WeixinJSBridge) {
        try {
            WeixinJSBridge.invoke('getNetworkType', {}, startWechatBgm, false);
        } catch (e) {
            document.addEventListener("WeixinJSBridgeReady", startWechatBgm, false);
        }
    } else {
        document.addEventListener("WeixinJSBridgeReady", startWechatBgm, false);
    }

    // Start background music on user's first window interaction (fallback)
    const startAudioOnTouch = () => {
        if (musicEnabled) {
            musicManager.play();
        }
        window.removeEventListener('click', startAudioOnTouch);
        window.removeEventListener('touchstart', startAudioOnTouch);
    };
    window.addEventListener('click', startAudioOnTouch);
    window.addEventListener('touchstart', startAudioOnTouch);
});
