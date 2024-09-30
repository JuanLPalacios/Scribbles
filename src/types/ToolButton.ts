import { ToolFunctions } from '../contexts/ToolContext';

export type ToolButton = {
    key:number
    ToolC:(params:ToolFunctions)=>JSX.Element
    name:string
    icon:string
}