import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
vi.mock('abr-js', () => ({
    loadAbrBrushes: vi.fn(async () => []),
}));
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
import App from '../App';
import { renderWithProviders } from './utils';
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

// Helper component to exercise saving actions via hooks
import { useDrawing } from '../hooks/useDrawing';
import { useEditor } from '../hooks/useEditor';

function SaveActions() {
    const [editor] = useEditor();
    if (!editor.drawing) return null;
    return <InnerSaveActions />;
}

function InnerSaveActions() {
    const [, actions] = useDrawing();
    return (
        <div>
            <button onClick={() => actions.downloadFile()} aria-label="downloadFile">download</button>
            <button onClick={() => actions.exportPNG()} aria-label="exportPNG">exportPNG</button>
            <button onClick={() => actions.localSave()} aria-label="localSave">localSave</button>
        </div>
    );
}

it('calls saveAs for .scribble and .png exports, and localSave resolves', async () => {
    renderWithProviders(<><App /><SaveActions /></>);

    const openBlank = await screen.findByRole('button', { name: /Open blank scribble/i, timeout: 10000 });
    await userEvent.click(openBlank);

    // Trigger download .scribble
    const downloadBtn = await screen.findByRole('button', { name: /download/i, timeout: 10000 });
    await userEvent.click(downloadBtn);
    expect((fileSaver as unknown as { saveAs: ReturnType<typeof vi.fn> }).saveAs).toHaveBeenCalled();
    // Trigger export PNG
    const exportBtn = await screen.findByRole('button', { name: /exportPNG/i, timeout: 10000 });
    await userEvent.click(exportBtn);
    expect((fileSaver as unknown as { saveAs: ReturnType<typeof vi.fn> }).saveAs).toHaveBeenCalledTimes(2);
    // Trigger local save (no saveAs, but should not throw)
    const saveBtn = await screen.findByRole('button', { name: /localSave/i, timeout: 10000 });
    await userEvent.click(saveBtn);
}, 60000); // 60 second timeout for this test
