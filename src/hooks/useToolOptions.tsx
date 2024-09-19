import { useContext } from 'react';
import { ToolOptionsContext } from '../contexts/ToolOptionsContext';

export const useToolOptions = () => useContext(ToolOptionsContext);
