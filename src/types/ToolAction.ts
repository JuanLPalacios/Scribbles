import { MenuOptions } from './MenuOptions';

export type ToolAction = (options:MenuOptions, setOptions:(options:MenuOptions)=>void) => void