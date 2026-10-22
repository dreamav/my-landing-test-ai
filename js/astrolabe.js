// ============================================================
// KINETIC DA VINCI ASTROLABE (Interactive 2D/3D Canvas)
// Embedded directly inside Codex Page 6 (Interactive Lab)
// ============================================================

class DaVinciAstrolabe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.width = 400;
        this.height = 400;
        this.angleOuter = 0;
        this.angleInner = 0;
        this.angleCore = 0;
        
        this.targetTiltX = 0;
        this.targetTiltY = 0;
        this.tiltX = 0;
        this.tiltY = 0;

        this.particles = [];
        this.mousePos = { x: 200, y: 200, isHovered: false };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('mousemove', (e) => {
            e.stopPropagation();
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
            this.mousePos.isHovered = true;

            const cx = rect.width / 2;
            const cy = rect.height / 2;
            this.targetTiltX = (this.mousePos.x - cx) / cx * 18;
            this.targetTiltY = (this.mousePos.y - cy) / cy * 18;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos.isHovered = false;
            this.targetTiltX = 0;
            this.targetTiltY = 0;
        });

        this.canvas.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            this.burstParticles(clickX, clickY);
            if (window.codexAudio) window.codexAudio.playTabClick();
        });

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 380;
        this.height = rect.height || 380;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    burstParticles(x, y) {
        for (let i = 0; i < 32; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 4.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.02,
                size: 1.5 + Math.random() * 2.5,
                color: Math.random() > 0.4 ? '#dfba73' : '#00f2fe'
            });
        }
    }

    drawGear(cx, cy, radius, teeth, toothDepth, angle, color) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        ctx.beginPath();
        const step = (Math.PI * 2) / teeth;
        for (let i = 0; i < teeth; i++) {
            const a1 = i * step;
            const a2 = a1 + step * 0.25;
            const a3 = a1 + step * 0.5;
            const a4 = a1 + step * 0.75;
            
            const rOuter = radius + toothDepth;
            const rInner = radius;

            ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
            ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
            ctx.lineTo(Math.cos(a3) * rOuter, Math.sin(a3) * rOuter);
            ctx.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner circle of gear
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    loop() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Smooth tilt interpolation
        this.tiltX += (this.targetTiltX - this.tiltX) * 0.08;
        this.tiltY += (this.targetTiltY - this.tiltY) * 0.08;

        const cx = this.width / 2;
        const cy = this.height / 2;

        this.angleOuter += 0.0035;
        this.angleInner -= 0.006;
        this.angleCore += 0.009;

        ctx.save();
        // Perspective distortion simulation
        ctx.translate(cx + this.tiltX * 1.5, cy + this.tiltY * 1.5);

        // Dynamic scale based on canvas size
        const baseR = Math.min(this.width, this.height) * 0.45;

        // Ambient glow around center
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, baseR * 1.1);
        grad.addColorStop(0, 'rgba(223, 186, 115, 0.14)');
        grad.addColorStop(0.5, 'rgba(0, 242, 254, 0.05)');
        grad.addColorStop(1, 'rgba(10, 12, 16, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, baseR * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Outer Ring 1: Celestial Astrolabe Scale
        ctx.strokeStyle = 'rgba(223, 186, 115, 0.55)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, 0, baseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(223, 186, 115, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, baseR * 0.94, 0, Math.PI * 2);
        ctx.stroke();

        // Degree ticks around outer ring
        ctx.save();
        ctx.rotate(this.angleOuter * 0.4);
        for (let i = 0; i < 72; i++) {
            const rad = (i / 72) * Math.PI * 2;
            const isMajor = i % 6 === 0;
            const len = isMajor ? (baseR * 0.06) : (baseR * 0.03);
            const r1 = baseR;
            const r2 = baseR - len;

            ctx.strokeStyle = isMajor ? 'rgba(223, 186, 115, 0.8)' : 'rgba(223, 186, 115, 0.3)';
            ctx.lineWidth = isMajor ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(Math.cos(rad) * r1, Math.sin(rad) * r1);
            ctx.lineTo(Math.cos(rad) * r2, Math.sin(rad) * r2);
            ctx.stroke();
        }
        ctx.restore();

        // Mechanical Gears
        this.drawGear(0, 0, baseR * 0.72, 28, 6, this.angleOuter, 'rgba(223, 186, 115, 0.45)');
        this.drawGear(0, 0, baseR * 0.52, 20, 5, this.angleInner, 'rgba(0, 242, 254, 0.4)');

        // Sacred Hexagram / Triangle Matrix
        ctx.save();
        ctx.rotate(this.angleInner);
        ctx.strokeStyle = 'rgba(223, 186, 115, 0.35)';
        ctx.lineWidth = 1;
        for (let k = 0; k < 2; k++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const a = (i * 2 * Math.PI) / 3;
                const r = baseR * 0.40;
                const x = Math.cos(a) * r;
                const y = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();

        // Central Core Sun & Pointer
        ctx.save();
        ctx.rotate(this.angleCore);
        ctx.strokeStyle = '#ffd77a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -baseR * 0.34);
        ctx.lineTo(0, baseR * 0.34);
        ctx.moveTo(-baseR * 0.34, 0);
        ctx.lineTo(baseR * 0.34, 0);
        ctx.stroke();

        ctx.fillStyle = '#dfba73';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0a0c10';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Particles rendering & physics
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x - cx, p.y - cy, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();

        requestAnimationFrame(this.loop);
    }
}

window.DaVinciAstrolabe = DaVinciAstrolabe;
