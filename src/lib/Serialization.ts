import { BrushList } from './BrushList';
import { SerializedImageData } from '../types/SerializedImageData';
import { CompressedOject } from '../types/CompressedOject';
import { serializeImageData } from './serializeJSON';
import { SerializedSolidBrush } from '../brushes/SolidC';
import { SerializedTextureBrush } from '../brushes/TextureC';
import { SerializedStiffBrush } from '../brushes/StiffC';
import { SerializedMarkerBrush } from '../brushes/MarkerC';
import { BRUSH_TYPE_LIST } from '../abstracts/BrushC';

export type SerializedBrush =
| SerializedSolidBrush
| SerializedTextureBrush
| SerializedStiffBrush
| SerializedMarkerBrush;

export type Compressed = {[key:string]:CompressedValue};
export type CompressedValue = number | string | boolean | CompressedOject  | CompressedValue[];

export type Serialized = {[key:string]:SerializedValue};
export type SerializedValue = number | string | boolean | Serialized | SerializedImageData | SerializedValue[];

export function isSerializedImageData(value: SerializedImageData | Serialized): value is SerializedImageData {
    return (value as SerializedImageData).colorSpace !== undefined;
}

export const abrToScribblesSerializable = (abrBrush: AbrBrush): SerializedBrush => {
    const { brushType } = abrBrush;
    switch (brushType) {
    case 1:
        return abrComputedBrushToSolid(abrBrush);
    case 2:
        return abrSampledBrushToTextured(abrBrush);
    default:
        return BRUSH_TYPE_LIST[0][1];
    }
};
function abrComputedBrushToSolid({ angle, diameter, hardness, name, roundness, spacing }: AbrComputedBrush): SerializedSolidBrush {
    return { scribbleBrushType: BrushList.Solid, angle, diameter, hardness, name, roundness, spacing };
}

function abrSampledBrushToTextured({ antiAliasing, brushTipImage, name, spacing }: AbrSampledBrush): SerializedTextureBrush {
    const ctx = brushTipImage.getContext('2d');
    if(!ctx)throw new Error('can\'t create image context');
    const imageData = ctx.getImageData(0, 0, brushTipImage.width, brushTipImage.height);
    for (let i = 0; i < (imageData.data.length||0); i+=4) {
        imageData.data[i+3] = 255 - imageData.data[i];
        imageData.data[i] = 0;
        imageData.data[i+1] = 0;
        imageData.data[i+2] = 0;
    }
    return { scribbleBrushType: BrushList.Texture, antiAliasing, brushTipImage: serializeImageData(imageData), name, spacing };
}
