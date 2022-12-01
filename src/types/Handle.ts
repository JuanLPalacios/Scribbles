import { MenuOptions } from './MenuOptions';
import { Point } from './Point';

export interface Handle {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
    onMouseDown:(e:React.MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>)=>void)=>void
}