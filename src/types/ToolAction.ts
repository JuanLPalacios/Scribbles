import { MenuOptions } from '../contexts/MenuOptions';

export type ToolAction = (options:MenuOptions, setOptions:(options:MenuOptions)=>void) => void