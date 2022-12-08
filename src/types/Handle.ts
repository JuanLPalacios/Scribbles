import { MenuOptions } from '../contexts/MenuOptions';

export interface Handle {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
    onMouseDown:(point:DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>)=>void)=>void
}