// Mobile Touch Controls
class TouchController {
  constructor(onSwipe) {
    this.startX = 0;
    this.startY = 0;
    this.onSwipe = onSwipe;
    this.threshold = 30;
    this.bind();
  }

  bind() {
    document.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - this.startX;
      const dy = e.changedTouches[0].clientY - this.startY;
      if (Math.abs(dx) < this.threshold && Math.abs(dy) < this.threshold) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        this.onSwipe(dy > 0 ? 'down' : 'up');
      }
    }, { passive: true });
  }
}

window.touchController = new TouchController((dir) => {
  const dirMap = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const d = dirMap[dir];
  if (window.game && d) window.game.setDirection(d);
});
