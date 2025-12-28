import { useCallback, useEffect, useMemo, useState } from 'react';
import '../../css/Menu.css';
import '../../css/menu/LoadFile.css';
import folderIcon from '../../icons/folder-open-svgrepo-com.svg';
import listIcon from '../../icons/layout-list-svgrepo-com.svg';
import gridIcon from '../../icons/layout-grid-svgrepo-com.svg';
import { useEditor } from '../../hooks/useEditor';
import ReactModal from 'react-modal';
import { useOpenFile } from '../../hooks/useOpenFile';
import { createStorageHook } from '../../generators/createStorageHook';
import { StoredFile, useResentScribbles } from '../../hooks/useResentScribbles';
import { uid } from '../../lib/uid';
import { useShortcut } from '../../hooks/useShortcut';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { useGoogleDriveFileList } from '../../hooks/useGoogleDriveFileList';
import { downloadFileFromDrive } from '../../lib/GoogleDriveApi';
import { FileList } from '../FileList';

// Persistent view preference for Load modal (list vs thumbnails)
const useLoadView = createStorageHook<{ mode: 'list'|'thumbs' }>('load-view', 'local', { mode: 'list' });
export const LoadFile = () => {
    const [editor, { openFile, loadFile }] = useEditor();
    const { isConnected, config } = useGoogleDrive();
    const { files: driveFiles, loading: driveLoading, error: driveError, loadFiles } = useGoogleDriveFileList();
    const [isOpen, setOpen] = useState(false);
    const [resentScribbles] = useResentScribbles();
    const [loadView, setLoadView] = useLoadView();
    const [, setLoadingDriveFileId] = useState<string | null>(null);
    const openModal = useCallback(() => setOpen(true), []);
    const openFileL = useOpenFile((files) => {
        if (files.length === 0) return;
        const file = files[0];
        openFile(file);
    }, [openFile],
    { accept: '.jpg, .jpeg, .png, .scribble' }
    );

    useEffect(() => {
        setOpen(false);
    }, [editor.drawing]);

    // Load Google Drive files when modal opens and user is connected
    useEffect(() => {
        if (isOpen && isConnected) {
            loadFiles();
        }
    }, [isOpen, isConnected, loadFiles]);

    const handleLoadFromDrive = useCallback(async (fileId: string, fileName: string) => {
        if (!config?.accessToken) {
            alert('Not connected to Google Drive');
            return;
        }

        setLoadingDriveFileId(fileId);
        try {
            const blob = await downloadFileFromDrive(fileId, config.accessToken);
            const file = new File([blob], fileName, { type: blob.type });
            openFile(file);
        } catch (err) {
            console.error('Failed to load file from Google Drive:', err);
            alert('Failed to load file from Google Drive');
        } finally {
            setLoadingDriveFileId(null);
        }
    }, [config?.accessToken, openFile]);

    // Build merged file list with sync indicators
    const mergedFiles: StoredFile[] = useMemo(() => {
        const localByName = new Map<string, StoredFile>();
        resentScribbles.forEach(sf => localByName.set(sf.name, sf));

        const driveMapped: StoredFile[] = driveFiles.map(df => {
            const isSynced = localByName.has(df.name);
            const displayName = isSynced ? `${df.name} (synced)` : df.name;
            return {
                key: uid(),
                path: `drive:${df.id}`,
                name: displayName,
                chunks: 0,
            };
        });

        const localMapped: StoredFile[] = resentScribbles.map(sf => {
            const isSynced = driveFiles.some(df => df.name === sf.name);
            const displayName = isSynced ? `${sf.name} (synced)` : sf.name;
            return { ...sf, name: displayName };
        });

        // Prefer showing local first, then drive
        return [...localMapped, ...driveMapped];
    }, [resentScribbles, driveFiles]);

    const handleMergedClick = useCallback((file: StoredFile) => {
        if (file.path?.startsWith('drive:')) {
            const fileId = file.path.substring('drive:'.length);
            // Strip the label from name when loading
            const baseName = file.name.replace(/ \(synced\)$/i, '');
            void handleLoadFromDrive(fileId, baseName);
            return;
        }
        // Local file
        loadFile(file);
    }, [handleLoadFromDrive, loadFile]);

    useShortcut(openModal, ['CTRL+L', 'SHIFT+L']);
    useShortcut(openFileL, ['CTRL+O', 'SHIFT+O']);

    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={folderIcon} alt="Load Scribble" />
            </button>
            <div className="text">Load Scribble</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={() => setOpen(false)} style={{ content: { width: '20rem' } }}>
            <div className="LoadFile fields import-brush">
                <h2>Load Scribble</h2>
                <div className='actions right'>
                    <button onClick={openFileL}>Open File</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                    <h4>Saved Scribbles</h4>
                    <div className="FileList-viewToggle" style={{ display: 'flex', gap: 8 }}>
                        <button onClick={()=>setLoadView({ mode: 'list' })} disabled={loadView.mode==='list'} title="List view"><img src={listIcon} alt="List view" /></button>
                        <button onClick={()=>setLoadView({ mode: 'thumbs' })} disabled={loadView.mode==='thumbs'} title="Thumbnails view"><img src={gridIcon} alt="Thumbnails view" /></button>
                    </div>
                </div>
                {driveLoading ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
                ) : driveError ? (
                    <div style={{ padding: '1rem', color: 'red' }}>Error: {driveError}</div>
                ) : mergedFiles.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>No files found</div>
                ) : (
                    <FileList
                        files={mergedFiles}
                        mode={loadView.mode}
                        variant={'modal'}
                        onFileClick={handleMergedClick}
                    />
                )}
                <div className='actions'>
                    <button onClick={() => setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

