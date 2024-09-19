import { useContext } from 'react';
import { BrushesOptionsContext } from '../contexts/BrushesOptionsContext';

export const useBrushesOptions = () => useContext(BrushesOptionsContext);
