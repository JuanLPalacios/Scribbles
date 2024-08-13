export const sum = (a:DOMPoint, ...others:DOMPoint[]) => others.reduce((a:DOMPoint, b:DOMPoint) => new DOMPoint(a.x+b.x, a.y+b.y, a.z+b.z), a);

export const sub = (a:DOMPoint, b:DOMPoint) => new DOMPoint(b.x-a.x, b.y-a.y, b.z-a.z);

export const scalePoint = (a:DOMPoint, ...others:Array<DOMPoint|number>) => others.reduce((a:DOMPoint, b:DOMPoint|number) =>
    (typeof b == 'number')?
        new DOMPoint(b*a.x, b*a.y, b*a.z)
        : new DOMPoint(b.x*a.x, b.y*a.y, b.z*a.z)
, a);

export const translateMatrix = (matrix:DOMMatrix, vec:DOMPoint|number, y = 0, z = 0) => {
    return (typeof vec == 'number')?
        matrix.translate(vec, y, z)
        : matrix.translate(vec.x, vec.y, vec.z);
};

export const distance2d = (p1: [number, number], p2: [number, number]) => Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);

export const squaredDistanceToSegment2d = (p: [number, number], v: [number, number], w: [number, number]) => {
    const l2 = distance2d(v, w) ** 2;
    if (l2 === 0) return distance2d(p, v) ** 2;
    const t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    if (t < 0) return distance2d(p, v) ** 2;
    if (t > 1) return distance2d(p, w) ** 2;
    return distance2d(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]) ** 2;
};

export const createBezier = (points: [number, number][]) => {
    if (points.length < 3) {
        throw new Error('a minimum of 3 points is required to create a bezier');
    }
    const p0 = points[0];
    let p1 = points[Math.floor(points.length / 3)];
    let p2 = points[Math.floor(2 * points.length / 3)];
    const p3 = points[points.length - 1];

    const maxIterations = 1000;
    const epsilon = 0.001;
    let prevError = Infinity;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let error = 0;

        for (let i = 1; i < points.length - 1; i++) {
            const t = i / (points.length - 1);
            const b0 = (1 - t) ** 3;
            const b1 = 3 * t * (1 - t) ** 2;
            const b2 = 3 * t ** 2 * (1 - t);
            const b3 = t ** 3;

            const point = points[i];
            const bezierPoint = [
                b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0],
                b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1]
            ];

            error += squaredDistanceToSegment2d(point, p0, p3);

            p1 = [
                p1[0] + (point[0] - bezierPoint[0]) * b1 * 0.1,
                p1[1] + (point[1] - bezierPoint[1]) * b1 * 0.1
            ];
            p2 = [
                p2[0] + (point[0] - bezierPoint[0]) * b2 * 0.1,
                p2[1] + (point[1] - bezierPoint[1]) * b2 * 0.1
            ];
        }

        if (Math.abs(error - prevError) < epsilon) {
            break;
        }
        prevError = error;
    }

    return [p0, p1, p2, p3];
};

export function createPerpendicularVector(v: [number, number], l = 1) {
    const magnitude = magnitude2d(v);
    return [
        -v[1] * l / magnitude,
        v[0] * l / magnitude
    ];
}

export function magnitude2d(v: [number, number]) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

