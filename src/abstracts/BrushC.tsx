import { BrushList } from '../lib/BrushList';
import { SerializedBrush } from '../lib/Serialization';
import { MarkerC } from '../brushes/MarkerC';
import { SolidC } from '../brushes/SolidC';
import { BrushMapper } from '../contexts/BrushMapper';
import { StiffC } from '../brushes/StiffC';
import { TextureC } from '../brushes/TextureC';
import { BrushPair } from '../contexts/BrushRendererContext';
import { Pattern } from '../brushes/Pattern';

export const BRUSH_TYPE_LIST:BrushPair<SerializedBrush>[] = [
    [SolidC, {
        scribbleBrushType: BrushList.Solid,
        name: 'SolidBrush',
        angle: 0,
        hardness: 1,
        roundness: 1,
        spacing: 300
    },],
    [TextureC, {
        scribbleBrushType: BrushList.Texture,
        name: 'TextureBrush',
        brushTipImage: {
            colorSpace: 'srgb',
            height: 5,
            width: 5,
            data: [
                0, 1, 1, 1, 0,
                1, 1, 1, 1, 1,
                1, 1, 1, 1, 1,
                1, 1, 1, 1, 1,
                0, 1, 1, 1, 0,
            ].map((x)=>[0, 0, 0, x*255]).flat()
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
    }],
    [Pattern, {
        scribbleBrushType: BrushList.Pattern,
        name: 'Pattern',
        brushPatternImage: {
            colorSpace: 'srgb',
            height: 5,
            width: 5,
            data: [
                0, 1, 0, 1, 0,
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0,
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0,
            ].map((x)=>[0, 0, 0, x*255]).flat()
        },
        hardness: 1,
        spacing: 30
    }]
];

export const BrushC = BrushMapper<SerializedBrush>(BRUSH_TYPE_LIST);
