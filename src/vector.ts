export type Rotation = 0 | 1 | 2 | 3;
export function rot(r: number) {
	return (((r % 4) + 4) % 4) as Rotation;
}

export class Vector {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	scale(a: number) {
		return new Vector(this.x * a, this.y * a);
	}
	rotate(r: number) {
		switch (rot(r)) {
			case 0:
				return new Vector(this.x, this.y);
			case 1:
				return new Vector(-this.y, this.x);
			case 2:
				return new Vector(-this.x, -this.y);
			case 3:
				return new Vector(this.y, -this.x);
		}
	}
	add(v: Vector) {
		return new Vector(this.x + v.x, this.y + v.y);
	}
	sub(v: Vector) {
		return new Vector(this.x - v.x, this.y - v.y);
	}
	min(v: Vector) {
		return new Vector(Math.min(this.x, v.x), Math.min(this.y, v.y));
	}
	max(v: Vector) {
		return new Vector(Math.max(this.x, v.x), Math.max(this.y, v.y));
	}
}
