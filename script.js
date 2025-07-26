// 対称ゲーム JavaScript
class SymmetryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        
        // ゲーム設定
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        this.colorEmojis = ['🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '🟤'];
        this.currentColorIndex = 0;
        this.brushSizes = [3, 6, 10];
        this.brushSizeNames = ['小', '中', '大'];
        this.currentSizeIndex = 1;
        this.symmetryModes = [2, 4, 6, 8];
        this.currentSymmetryIndex = 0;
        
        this.initCanvas();
        this.bindEvents();
        this.updateUI();
    }
    
    initCanvas() {
        // キャンバスサイズを設定
        const container = document.querySelector('.canvas-container');
        const maxWidth = Math.min(500, container.clientWidth - 40);
        const maxHeight = Math.min(500, window.innerHeight * 0.5);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // 背景を白に設定
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 中心点を計算
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // 描画設定
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    bindEvents() {
        // ボタンイベント
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('colorBtn').addEventListener('click', () => this.changeColor());
        document.getElementById('modeBtn').addEventListener('click', () => this.changeSymmetryMode());
        document.getElementById('sizeBtn').addEventListener('click', () => this.changeBrushSize());
        
        // マウスイベント
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // タッチイベント（スマホ対応）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            setTimeout(() => this.initCanvas(), 100);
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        const currentX = pos.x;
        const currentY = pos.y;
        
        // 対称描画
        this.drawSymmetric(this.lastX, this.lastY, currentX, currentY);
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    drawSymmetric(x1, y1, x2, y2) {
        const symmetryCount = this.symmetryModes[this.currentSymmetryIndex];
        const angleStep = (2 * Math.PI) / symmetryCount;
        
        this.ctx.strokeStyle = this.colors[this.currentColorIndex];
        this.ctx.lineWidth = this.brushSizes[this.currentSizeIndex];
        
        for (let i = 0; i < symmetryCount; i++) {
            const angle = i * angleStep;
            
            // 中心からの相対座標を計算
            const relX1 = x1 - this.centerX;
            const relY1 = y1 - this.centerY;
            const relX2 = x2 - this.centerX;
            const relY2 = y2 - this.centerY;
            
            // 回転変換
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            const rotX1 = relX1 * cos - relY1 * sin + this.centerX;
            const rotY1 = relX1 * sin + relY1 * cos + this.centerY;
            const rotX2 = relX2 * cos - relY2 * sin + this.centerX;
            const rotY2 = relX2 * sin + relY2 * cos + this.centerY;
            
            // 線を描画
            this.ctx.beginPath();
            this.ctx.moveTo(rotX1, rotY1);
            this.ctx.lineTo(rotX2, rotY2);
            this.ctx.stroke();
            
            // 反射対称も追加（より美しい模様のため）
            if (symmetryCount > 2) {
                const refX1 = relX1 * cos + relY1 * sin + this.centerX;
                const refY1 = -relX1 * sin + relY1 * cos + this.centerY;
                const refX2 = relX2 * cos + relY2 * sin + this.centerX;
                const refY2 = -relX2 * sin + relY2 * cos + this.centerY;
                
                this.ctx.beginPath();
                this.ctx.moveTo(refX1, refY1);
                this.ctx.lineTo(refX2, refY2);
                this.ctx.stroke();
            }
        }
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 楽しいクリアアニメーション
        this.animateClear();
    }
    
    animateClear() {
        let opacity = 0.5;
        const animate = () => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            opacity -= 0.05;
            if (opacity > 0) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    changeColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        this.updateUI();
        this.animateButton('colorBtn');
    }
    
    changeSymmetryMode() {
        this.currentSymmetryIndex = (this.currentSymmetryIndex + 1) % this.symmetryModes.length;
        this.updateUI();
        this.animateButton('modeBtn');
    }
    
    changeBrushSize() {
        this.currentSizeIndex = (this.currentSizeIndex + 1) % this.brushSizes.length;
        this.updateUI();
        this.animateButton('sizeBtn');
    }
    
    updateUI() {
        document.getElementById('currentColor').textContent = this.colorEmojis[this.currentColorIndex];
        document.getElementById('symmetryCount').textContent = this.symmetryModes[this.currentSymmetryIndex];
        document.getElementById('modeBtn').textContent = `対称モード: ${this.symmetryModes[this.currentSymmetryIndex]}方向`;
        document.getElementById('sizeBtn').textContent = `筆のサイズ: ${this.brushSizeNames[this.currentSizeIndex]}`;
    }
    
    animateButton(buttonId) {
        const button = document.getElementById(buttonId);
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }
}

// ゲーム開始
window.addEventListener('DOMContentLoaded', () => {
    new SymmetryGame();
});
