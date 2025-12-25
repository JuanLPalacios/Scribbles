import { useMemo } from 'react';
import { uid } from '../lib/uid';
import { StoredFile } from '../hooks/useResentScribbles';
import '../css/components/FileList.css';

interface FileListProps {
    files: StoredFile[];
    mode: 'list' | 'thumbs';
    onFileClick: (file: StoredFile) => void;
    limit?: number;
    variant?: 'quickstart' | 'modal';
}

export const FileList = ({ files, mode, onFileClick, limit, variant = 'quickstart' }: FileListProps) => {
    const id = useMemo(() => uid(), []);
    const displayFiles = limit ? files.slice(0, limit) : files;

    return (
        <div className={`FileList FileList--${variant} FileList--${mode}`}>
            {mode === 'list' ? (
                displayFiles.map((file, i) => (
                    <button
                        key={`${id}-${i}`}
                        onClick={() => onFileClick(file)}
                        className={file.thumbnail ? 'with-thumbnail' : ''}
                    >
                        {file.thumbnail && <img src={file.thumbnail} alt="" className="file-thumbnail" />}
                        <span>{file.name}</span>
                    </button>
                ))
            ) : (
                <div className="thumbnails-grid">
                    {displayFiles.map((file, i) => (
                        <button
                            key={`${id}-thumb-${i}`}
                            onClick={() => onFileClick(file)}
                            className="with-thumbnail"
                        >
                            {file.thumbnail && <img src={file.thumbnail} alt="" className="file-thumbnail" />}
                            <span>{file.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
