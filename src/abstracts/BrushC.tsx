import { BrushList } from '../lib/BrushList';
import { SerializedBrush } from '../lib/Serialization';
import { MarkerC } from '../brushes/MarkerC';
import { SolidC } from '../brushes/SolidC';
import { BrushMapper } from '../contexts/BrushMapper';
import { StiffC } from '../brushes/StiffC';
import { TextureC } from '../brushes/TextureC';
import { BrushPair } from '../contexts/BrushRendererContext';

export const BRUSH_TYPE_LIST:BrushPair<SerializedBrush>[] = [
    [SolidC, {
        scribbleBrushType: BrushList.Solid,
        name: 'SolidBrush',
        angle: 0,
        diameter: 1,
        hardness: 1,
        roundness: 1,
        spacing: 300
    },],
    [TextureC, {
        scribbleBrushType: BrushList.Texture,
        name: 'TextureBrush',
        brushTipImage: {
            colorSpace: 'srgb',
            height: 1,
            width: 1,
            data: [0, 0, 0, 0]
        },
        spacing: 0,
        antiAliasing: true,
    }],
    [MarkerC, {
        scribbleBrushType: BrushList.Marker,
        name: 'Marker'
    }],
    [StiffC, {
        scribbleBrushType: BrushList.Stiff,
        name: 'Stiff',
        fibers: []
    }]
];

export const BrushC = BrushMapper<SerializedBrush>(BRUSH_TYPE_LIST);
