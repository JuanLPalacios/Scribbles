import { useContext } from 'react';
import { ToolContext } from '../contexts/ToolContext';

export function useTool() {
    return useContext(ToolContext);
}
