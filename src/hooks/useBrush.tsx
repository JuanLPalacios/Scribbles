import { useContext } from 'react';
import { BrushRendererContext } from '../contexts/BrushRendererContext';

export const useBrush = () => useContext(BrushRendererContext);

