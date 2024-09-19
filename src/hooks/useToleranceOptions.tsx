import { useContext } from 'react';
import { ToleranceOptionsContext } from '../contexts/ToleranceOptionsContext';

export const useToleranceOptions = () => useContext(ToleranceOptionsContext);
