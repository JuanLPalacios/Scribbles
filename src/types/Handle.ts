import { Point } from './Point';

export interface Handle {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
}