import { ToolFunctions } from '../contexts/ToolContext';

export type ToolButton = {
    key:number
    Tool:(params:ToolFunctions)=>JSX.Element
    name:string
    icon:string
}