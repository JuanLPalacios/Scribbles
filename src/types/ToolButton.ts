import Tool from '../abstracts/Tool';
import { ToolFunctions } from '../contexts/ToolContext';

export type ToolButton = {
    key:number
    Tool:Tool
    ToolC:(params:ToolFunctions)=>JSX.Element
    name:string
    icon:string
}