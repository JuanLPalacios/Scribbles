import { createStorageHook } from '../generators/createStorageHook';
import { StoredFile } from './useResentScribbles';

export const useStoredFiles = createStorageHook<StoredFile[]>('resent-files', 'local', []);
