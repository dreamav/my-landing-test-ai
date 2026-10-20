// ============================================================
// CINEMATIC BLUEPRINT BACKGROUND & PARTICLES
// ============================================================

class CodexBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouse = { x: this.width / 2, y: this.height / 2, targetX: this.width / 2, targetY: this.height / 2 };
        this.dustParticles = [];
        this.gridSize = 64;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
        }, { passive: true });

        // Initialize dust motes
        const count = Math.min(60, Math.floor(this.width * this.height / 25000));
        for (let i = 0; i < count; i++) {
            this.dustParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.4 + 0.1,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.4 - 0.1,
                pulsateSpeed: Math.random() * 0.02 + 0.005,
                pulsatePhase: Math.random() * Math.PI * 2
            });
        }

        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Smooth cursor spotlight follow
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

        // 1. Dark Vignette Base
        const bgGrad = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 50,
            this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8
        );
        bgGrad.addColorStop(0, '#0c0f16');
        bgGrad.addColorStop(0.6, '#080a0e');
        bgGrad.addColorStop(1, '#040507');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Blueprint Grid with cursor lighting
        ctx.save();
        ctx.strokeStyle = 'rgba(223, 186, 115, 0.035)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let x = 0; x < this.width; x += this.gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        for (let y = 0; y < this.height; y += this.gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        ctx.stroke();

        // Crosshairs at grid intersections near mouse
        const mouseGridX = Math.round(this.mouse.x / this.gridSize) * this.gridSize;
        const mouseGridY = Math.round(this.mouse.y / this.gridSize) * this.gridSize;
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(mouseGridX, mouseGridY, 4, 0, Math.PI * 2);
        ctx.moveTo(mouseGridX - 10, mouseGridY);
        ctx.lineTo(mouseGridX + 10, mouseGridY);
        ctx.moveTo(mouseGridX, mouseGridY - 10);
        ctx.lineTo(mouseGridX, mouseGridY + 10);
        ctx.stroke();
        ctx.restore();

        // 3. Dynamic Cursor Ambient Light
        const spot = ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 450
        );
        spot.addColorStop(0, 'rgba(223, 186, 115, 0.07)');
        spot.addColorStop(0.4, 'rgba(0, 242, 254, 0.03)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, this.width, this.height);

        // 4. Floating Golden Dust Motes
        for (let i = 0; i < this.dustParticles.length; i++) {
            const p = this.dustParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulsatePhase += p.pulsateSpeed;

            if (p.y < 0) {
                p.y = this.height + 10;
                p.x = Math.random() * this.width;
            }
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;

            const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulsatePhase));
            ctx.fillStyle = `rgba(223, 186, 115, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(this.render);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CodexBackground('bg-canvas');
});
