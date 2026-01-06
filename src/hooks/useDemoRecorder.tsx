/**
 * Custom hook for accessing demo recorder context
 */

import { useContext } from 'react';
import { DemoRecorderContext } from '../contexts/DemoRecorderContext';

export const useDemoRecorder = () => {
    return useContext(DemoRecorderContext);
};
