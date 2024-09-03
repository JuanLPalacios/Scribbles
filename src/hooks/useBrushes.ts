import { useContext } from 'react';
import { BrushesContext } from '../contexts/BrushOptions';

export const useBrushes = ()=> useContext(BrushesContext);
