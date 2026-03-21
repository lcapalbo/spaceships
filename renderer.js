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
		// BGI: style 1 => solid fill, 0 => empty / no fill
		this.fillStyle = style;
		if (color !== undefined) {
			this.fillColor = this._resolveColor(color);
		}
		if (this.fillColor) {
			this.ctx.fillStyle = this.fillColor;
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
		const start = -1 * (startDeg * Math.PI) / 180;
		const end = -1 * (endDeg * Math.PI) / 180;
		this.ctx.beginPath();
		this.ctx.arc(x, y, r, start, end, true);
		this.ctx.stroke();
	}

	ellipse(x, y, startDeg, endDeg, rx, ry) {
		const start = -1 * (startDeg * Math.PI) / 180;
		const end = -1 * (endDeg * Math.PI) / 180;
		this.ctx.beginPath();
		if (this.ctx.ellipse) {
			this.ctx.ellipse(x, y, rx, ry, 0, start, end, true);
			this.ctx.stroke();
		} else {
			this.ctx.save();
			this.ctx.translate(x, y);
			this.ctx.scale(rx / ry, 1);
			this.ctx.arc(0, 0, ry, start, end, true);
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
		const start = -1 * (startDeg * Math.PI) / 180;
		const end = -1 * (endDeg * Math.PI) / 180;
		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.ctx.arc(x, y, r, start, end, true);
		this.ctx.closePath();
		if (this.fillStyle === 1) {
			this.ctx.fill();
		} else {
			this.ctx.stroke();
		}
	}

	floodFill(x, y, boundaryColor) {
		const width = this.canvas.width;
		const height = this.canvas.height;
		const imgData = this.ctx.getImageData(0, 0, width, height);
		const data = imgData.data;

		const boundRgba = this._hexToRgba(this._resolveColor(boundaryColor));
		const fillRgba = this._hexToRgba(this._resolveColor(this.fillColor || this.color));

		const sx = Math.floor(x);
		const sy = Math.floor(y);
		if (sx < 0 || sy < 0 || sx >= width || sy >= height) return;

		const startIdx = (sy * width + sx) * 4;
		const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];

		const sameColor = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
		if (sameColor(startColor, fillRgba)) return;

		const stack = [[sx, sy]];
		const visited = new Uint8Array(width * height);

		while (stack.length > 0) {
			const [px, py] = stack.pop();
			if (px < 0 || py < 0 || px >= width || py >= height) continue;
			const idx = py * width + px;
			if (visited[idx]) continue;

			const idx4 = idx * 4;
			const pixelColor = [data[idx4], data[idx4 + 1], data[idx4 + 2], data[idx4 + 3]];

			if (sameColor(pixelColor, boundRgba) || sameColor(pixelColor, fillRgba)) continue;
			if (!sameColor(pixelColor, startColor)) continue;

			data[idx4] = fillRgba[0];
			data[idx4 + 1] = fillRgba[1];
			data[idx4 + 2] = fillRgba[2];
			data[idx4 + 3] = fillRgba[3];

			visited[idx] = 1;

			stack.push([px + 1, py]);
			stack.push([px - 1, py]);
			stack.push([px, py + 1]);
			stack.push([px, py - 1]);
		}

		this.ctx.putImageData(imgData, 0, 0);
	}

	_hexToRgba(hex) {
		let c = hex.replace('#', '');
		if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
		const num = parseInt(c, 16);
		return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
	}
}

// export in module environments
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Renderer;
}
