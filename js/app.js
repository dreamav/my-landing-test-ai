// ============================================================
// CODEX CYBERNETICA // APPLICATION CONTROLLER
// Powered by StPageFlip (HTML5 + Web Audio + Canvas)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const bookElement = document.getElementById('book');
    if (!bookElement) return;

    // 1. Initialize StPageFlip instance
    const pageFlip = new St.PageFlip(bookElement, {
        width: 520, // Base single page width
        height: 720, // Base single page height
        size: 'stretch',
        minWidth: 320,
        maxWidth: 620,
        minHeight: 460,
        maxHeight: 880,
        maxShadowOpacity: 0.7,
        showCover: true,
        mobileScrollSupport: false,
        drawShadow: true,
        flippingTime: 800,
        usePortrait: true,
        startPage: 0,
        autoSize: true,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 25
    });

    const pageElements = document.querySelectorAll('.page');
    pageFlip.loadFromHTML(pageElements);

    // Expose for debugging/console interaction
    window.codexFlip = pageFlip;

    // 2. UI Elements
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const spreadTag = document.getElementById('spread-tag');
    const pageCounter = document.getElementById('page-counter');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const bookmarkTabs = document.querySelectorAll('.bookmark-tab');
    const toast = document.getElementById('codex-toast');
    const toastMsg = document.getElementById('toast-msg');

    // Section mapping for bookmark tabs
    // Cover: 0
    // Manifesto & Metrics: 1-2
    // Artifacts & Projects: 3-4
    // Arsenal & Lab: 5-6
    // Chronology & Alliance: 7-8
    // Back Cover: 9
    const tabDestinations = [
        { id: 'tab-cover', page: 0 },
        { id: 'tab-manifesto', page: 1 },
        { id: 'tab-projects', page: 3 },
        { id: 'tab-arsenal', page: 5 },
        { id: 'tab-lab', page: 6 },
        { id: 'tab-alliance', page: 7 }
    ];

    // Show Toast Notification
    function showToast(message) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    // 3. Sound Button Setup
    if (soundToggleBtn && window.codexAudio) {
        if (window.codexAudio.isMuted) {
            soundToggleBtn.classList.add('muted');
            soundToggleBtn.title = 'Включить звук ASMR';
        }

        soundToggleBtn.addEventListener('click', () => {
            const isMuted = window.codexAudio.toggleMute();
            if (isMuted) {
                soundToggleBtn.classList.add('muted');
                showToast('🔇 Звук кодекса отключен');
            } else {
                soundToggleBtn.classList.remove('muted');
                showToast('🔊 Звук кодекса включен (ASMR шелест)');
            }
        });
    }

    // 4. PageFlip Events
    pageFlip.on('init', (e) => {
        updateUIState(e.data.page);
        initAstrolabe();
    });

    pageFlip.on('flip', (e) => {
        const pageIdx = e.data;
        if (window.codexAudio) {
            window.codexAudio.playPageFlip();
        }
        updateUIState(pageIdx);
    });

    function updateUIState(pageIdx) {
        const total = pageFlip.getPageCount();
        const orientation = pageFlip.getOrientation();

        // Update Prev/Next Buttons state
        if (prevBtn) prevBtn.disabled = (pageIdx === 0);
        if (nextBtn) nextBtn.disabled = (pageIdx >= total - 1);

        // Update Spread Tag & Counter
        if (pageCounter) {
            pageCounter.textContent = `${pageIdx + 1} / ${total}`;
        }

        if (spreadTag) {
            if (pageIdx === 0) {
                spreadTag.textContent = 'FOLIO PRIMUS // Лицевая Обложка';
            } else if (pageIdx >= total - 1) {
                spreadTag.textContent = 'EPILOGUS // Задняя Обложка';
            } else if (orientation === 'landscape') {
                const spreadNum = Math.floor((pageIdx - 1) / 2) + 1;
                const titles = [
                    'FOLIO I // Манифест & Квадрант Компетенций',
                    'FOLIO II // Избранные Проекты & Архитектура',
                    'FOLIO III // Технический Стек & Лаборатория Да Винчи',
                    'FOLIO IV // Хронология Опыта & Сургучная Печать'
                ];
                spreadTag.textContent = titles[spreadNum - 1] || `Разворот ${spreadNum}`;
            } else {
                spreadTag.textContent = `Страница ${pageIdx + 1}`;
            }
        }

        // Update Active Bookmark Tab
        bookmarkTabs.forEach(tab => tab.classList.remove('active'));
        if (pageIdx === 0) {
            document.getElementById('tab-cover')?.classList.add('active');
        } else if (pageIdx === 1 || pageIdx === 2) {
            document.getElementById('tab-manifesto')?.classList.add('active');
        } else if (pageIdx === 3 || pageIdx === 4) {
            document.getElementById('tab-projects')?.classList.add('active');
        } else if (pageIdx === 5) {
            document.getElementById('tab-arsenal')?.classList.add('active');
        } else if (pageIdx === 6) {
            document.getElementById('tab-lab')?.classList.add('active');
        } else if (pageIdx >= 7) {
            document.getElementById('tab-alliance')?.classList.add('active');
        }
    }

    // 5. Bookmark Tabs Click Handlers
    bookmarkTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPage = parseInt(tab.dataset.page, 10);
            if (!isNaN(targetPage)) {
                if (window.codexAudio) window.codexAudio.playTabClick();
                pageFlip.flip(targetPage);
            }
        });
        tab.addEventListener('mouseenter', () => {
            if (window.codexAudio) window.codexAudio.playHover();
        });
    });

    // 6. Navigation Buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            pageFlip.flipPrev();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            pageFlip.flipNext();
        });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'PageDown', 'KeyL'].includes(e.code)) {
            pageFlip.flipNext();
        } else if (['ArrowLeft', 'PageUp', 'KeyH'].includes(e.code)) {
            pageFlip.flipPrev();
        } else if (e.code === 'Home') {
            pageFlip.flip(0);
        } else if (e.code === 'End') {
            pageFlip.flip(pageFlip.getPageCount() - 1);
        }
    });

    // 7. Interactive Cover Button (Unveil)
    const unveilBtn = document.getElementById('unveil-btn');
    if (unveilBtn) {
        unveilBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pageFlip.flipNext();
        });
    }

    // Return to start on back cover
    const returnStartBtn = document.getElementById('return-start-btn');
    if (returnStartBtn) {
        returnStartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pageFlip.flip(0);
        });
    }

    // 8. Contact Seal & Wax Stamp Interaction
    const waxSeal = document.getElementById('wax-seal');
    if (waxSeal) {
        waxSeal.addEventListener('click', (e) => {
            e.stopPropagation();
            waxSeal.classList.add('stamped');
            if (window.codexAudio) window.codexAudio.playWaxSeal();

            // Copy Email to clipboard
            const email = 'alex.vibe@codex-architect.dev';
            navigator.clipboard.writeText(email).then(() => {
                showToast('✨ Сургучная печать поставлена! Email скопирован: ' + email);
            }).catch(() => {
                showToast('✨ Печать закреплена! Напишите в Telegram @vibe_creator');
            });

            setTimeout(() => {
                waxSeal.classList.remove('stamped');
            }, 600);
        });
    }

    // Copy action buttons on contact page
    document.querySelectorAll('.copy-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const textToCopy = btn.dataset.copy;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                if (window.codexAudio) window.codexAudio.playTabClick();
                showToast('📋 Скопировано в буфер: ' + textToCopy);
            }
        });
    });

    document.querySelectorAll('.contact-channel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // 9. Interactive Project Viewfinder Tabs
    const vfTabs = document.querySelectorAll('.vf-tab');
    const telemetryBody = document.getElementById('telemetry-body');
    const projectData = {
        aetheria: {
            title: 'AETHERIA 3D ENGINE',
            fps: '144 FPS (WebGPU)',
            drawcalls: '18 calls',
            poly: '480,000 tris',
            status: 'STABLE // V.2.4.1',
            desc: 'Реализация физически корректного освещения PBR, воксельного террейна и процедурных шейдеров на чистом WGSL.'
        },
        quantum: {
            title: 'QUANTUM VAULT PROTOCOL',
            fps: '60 FPS (Zero Lag)',
            drawcalls: '12 calls',
            poly: '85,000 nodes',
            status: 'AUDITED // TVL $18.4M',
            desc: 'Высокочастотный торговый терминал с отрисовкой 100k транзакций/сек через WebSockets и WebAssembly Canvas.'
        },
        chronos: {
            title: 'CHRONOS TOURBILLON 3D',
            fps: '120 FPS (Three.js)',
            drawcalls: '26 calls',
            poly: '320,000 tris',
            status: 'PRODUCTION LUXURY',
            desc: 'Интерактивный кинематический конфигуратор часового механизма с тактильным звуковым сопровождением.'
        }
    };

    vfTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            vfTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const key = tab.dataset.project;
            const data = projectData[key];
            if (data && telemetryBody) {
                if (window.codexAudio) window.codexAudio.playTabClick();
                telemetryBody.innerHTML = `
                    <div>PROJ: <span class="val">${data.title}</span></div>
                    <div>STATUS: <span class="val">${data.status}</span></div>
                    <div>PERF: <span class="val">${data.fps} | ${data.drawcalls}</span></div>
                    <div>COMPLEXITY: <span class="val">${data.poly}</span></div>
                    <div style="margin-top: 6px; color: #8892b0; font-size: 8px;">${data.desc}</div>
                `;
            }
        });
    });

    // 10. Lazy initialize Astrolabe when Page 6 becomes visible
    let astrolabeInstance = null;
    function initAstrolabe() {
        if (!astrolabeInstance && window.DaVinciAstrolabe) {
            astrolabeInstance = new window.DaVinciAstrolabe('astrolabe-canvas');
        }
    }
});
