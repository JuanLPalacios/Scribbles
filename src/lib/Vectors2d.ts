import { Point } from '../types/Point';

export type Bezier = [Point, Point, Point, Point];

export const dotProduct2D = (a: Point, b: Point) => (a[0] * b[1] - a[1] * b[0]);
export const vectorProjection = (a: Point, b: Point) => (Math.abs(dotProduct2D(a, b))) / (Math.sqrt((b[0] ** 2) + (b[1] ** 2)));
export const difference = (a: Point, b: Point):Point =>[a[0]-b[0],  a[1]-b[1]];
export const length = (v: Point) =>Math.sqrt(v[0]**2 + v[1]**2);
export const distance2d = (a: Point, b: Point) => length(difference(a, b));

export const squaredDistanceToSegment2d = (p: Point, v: Point, w: Point) => {
    const l2 = distance2d(v, w) ** 2;
    if (l2 === 0) return distance2d(p, v) ** 2;
    const t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    if (t < 0) return distance2d(p, v) ** 2;
    if (t > 1) return distance2d(p, w) ** 2;
    return distance2d(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]) ** 2;
};

export const createBezier = (points: Point[]):Bezier => {
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
            const b0 = (1 - t)**3;
            const b1 = 3 * t * (1 - t)**2;
            const b2 = 3 * t**2 * (1 - t);
            const b3 = t**3;

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

export const bezierArcLength = (bezier: Bezier) =>(length(difference(bezier[0], bezier[1]))+length(difference(bezier[1], bezier[2]))+length(difference(bezier[2], bezier[3]))+length(difference(bezier[0], bezier[3])))/2;

export function createPerpendicularVector(v: Point, l = 1) {
    const magnitude = length(v);
    return [
        -v[1] * l / magnitude,
        v[0] * l / magnitude
    ];
}
