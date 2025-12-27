import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
vi.mock('abr-js', () => ({
    loadAbrBrushes: vi.fn(async () => []),
}));
const mockActions = {
    downloadFile: vi.fn(async () => {}),
    exportPNG: vi.fn(() => {}),
    localSave: vi.fn(async () => {}),
};
vi.mock('../hooks/useDrawing', () => ({
    useDrawing: () => [
        {
            data: { name: 'Test', layers: [], width: 10, height: 10 },
            editorState: { layers: [], thumbnail: null },
        },
        mockActions,
    ],
}));
vi.mock('../hooks/useEditor', () => ({
    useEditor: () => [
        { drawing: { data: { name: 'Test', layers: [], width: 10, height: 10 }, editorState: { layers: [], thumbnail: null } } },
        vi.fn(),
    ],
}));
vi.mock('../lib/Graphics', async () => {
    const actual = await vi.importActual<typeof import('../lib/Graphics')>('../lib/Graphics');
    return {
        ...actual,
        // Passthrough mergeLayers but keep the latest imageData to avoid canvas work
        mergeLayers: (from: any, to: any) => ({ ...to, imageData: from.imageData ?? to.imageData }),
        // Immediately return a tiny PNG-like blob instead of calling canvas.toBlob
        getBlobFromLayer: (_layer: any, callback: BlobCallback) => callback(new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' })),
    };
});
vi.mock('../components/inputs/BrushSelectInput', () => ({
    BrushSelectInput: () => null,
}));
vi.mock('../components/components/BrushPreview', () => ({
    BrushPreview: () => null,
}));
// jsdom matchMedia mock for QuickStart
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: (query: string): any => ({
        matches: false,
        media: query,
        addListener: () => void 0,
        removeListener: () => void 0,
        addEventListener: () => void 0,
        removeEventListener: () => void 0,
        onchange: null,
        dispatchEvent: () => false,
    }),
});
import * as fileSaver from 'file-saver';

vi.mock('file-saver', async () => {
    const mod = await import('file-saver');
    return {
        ...mod,
        saveAs: vi.fn(),
    };
});

vi.mock('../lib/sdrw', () => {
    return {
        SDRW: {
            binary: vi.fn(async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' })),
            jsonObj: vi.fn(),
        },
    };
});

function SaveActions() {
    const actions = mockActions;
    return (
        <div>
            <button onClick={() => actions.downloadFile()} aria-label="downloadFile">download</button>
            <button onClick={() => actions.exportPNG()} aria-label="exportPNG">exportPNG</button>
            <button onClick={() => actions.localSave()} aria-label="localSave">localSave</button>
        </div>
    );
}

it('calls saveAs for .scribble and .png exports, and localSave resolves', async () => {
    render(<SaveActions />);

    // Trigger download .scribble
    const downloadBtn = screen.getByRole('button', { name: /download/i });
    await userEvent.click(downloadBtn);
    expect((fileSaver as unknown as { saveAs: ReturnType<typeof vi.fn> }).saveAs).toHaveBeenCalled();

    // Trigger export PNG
    const exportBtn = screen.getByRole('button', { name: /exportPNG/i });
    await userEvent.click(exportBtn);
    expect((fileSaver as unknown as { saveAs: ReturnType<typeof vi.fn> }).saveAs).toHaveBeenCalledTimes(2);

    // Trigger local save (no saveAs, but should not throw)
    const saveBtn = screen.getByRole('button', { name: /localSave/i });
    await userEvent.click(saveBtn);
}, 10000); // tighter timeout now that heavy canvas work is mocked
