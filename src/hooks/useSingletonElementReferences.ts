import { useContext } from 'react';
import { SingletonElementReferencesContext } from '../contexts/SingletonElementReferences';

export const useSingletonElementReferences = () => useContext(SingletonElementReferencesContext);
