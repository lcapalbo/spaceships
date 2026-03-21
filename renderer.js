class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fillStyle = 1;
    this.color = 15;
    this.textStyle = { font: '12px monospace', align: 'left', baseline: 'top' };
    this.palette = {
      0: '#000000', 1: '#000080', 2: '#008000', 3: '#008080', 4: '#800000', 5: '#800080', 6: '#808000', 7: '#C0C0C0',
      8: '#808080', 9: '#0000FF', 10: '#00FF00', 11: '#00FFFF', 12: '#FF0000', 13: '#FF00FF', 14: '#FFFF00', 15: '#FFFFFF'
    };
  }

  _resolveColor(c) {
    if (typeof c === 'string') return c;
    return this.palette[c] || '#FFFFFF';
  }

  setColor(color) {
    this.color = color;
    const c = this._resolveColor(color);
    this.ctx.strokeStyle = c;
    this.ctx.fillStyle = c;
  }

  setFillStyle(style, color) {
    this.fillStyle = style;
    if (color !== undefined) {
      const c = this._resolveColor(color);
      this.ctx.fillStyle = c;
    }
  }

  clearScreen() {
    this.ctx.save();
    this.ctx.fillStyle = this._resolveColor(0);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  circle(x, y, r) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  arc(x, y, startDeg, endDeg, r) {
    const start = (startDeg * Math.PI) / 180;
    const end = (endDeg * Math.PI) / 180;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, start, end);
    this.ctx.stroke();
  }

  ellipse(x, y, startDeg, endDeg, rx, ry) {
    const start = (startDeg * Math.PI) / 180;
    const end = (endDeg * Math.PI) / 180;
    this.ctx.beginPath();
    if (this.ctx.ellipse) {
      this.ctx.ellipse(x, y, rx, ry, 0, start, end);
      this.ctx.stroke();
    } else {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.scale(rx / ry, 1);
      this.ctx.arc(0, 0, ry, start, end);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  outTextXY(x, y, text) {
    this.ctx.save();
    this.ctx.fillStyle = this._resolveColor(this.color);
    this.ctx.font = this.textStyle.font;
    this.ctx.textAlign = this.textStyle.align;
    this.ctx.textBaseline = this.textStyle.baseline;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  bar(left, top, right, bottom) {
    const w = right - left;
    const h = bottom - top;
    this.ctx.fillRect(left, top, w, h);
  }

  pieSlice(x, y, startDeg, endDeg, r) {
    const start = (startDeg * Math.PI) / 180;
    const end = (endDeg * Math.PI) / 180;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, r, start, end);
    this.ctx.closePath();
    if (this.fillStyle === 1) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  floodFill(x, y, color) {
    this.ctx.fillStyle = this._resolveColor(color || this.color);
    this.ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}

// export in module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}
