import { BrushList } from './BrushList';
import { SerializedImageData } from '../types/SerializedImageData';
import { CompressedImage, CompressedJSON, CompressedOject } from '../types/CompressedOject';
import { serializeImageData } from './serializeJSON';
import { SerializedSolidBrush } from '../brushes/SolidC';
import { SerializedTextureBrush } from '../brushes/TextureC';
import { SerializedStiffBrush } from '../brushes/StiffC';
import { SerializedMarkerBrush } from '../brushes/MarkerC';
import { SerializedPatternBrush } from '../brushes/Pattern';
import { BRUSH_TYPE_LIST } from '../abstracts/BrushC';

export type SerializedBrush =
| SerializedSolidBrush
| SerializedTextureBrush
| SerializedStiffBrush
| SerializedMarkerBrush
| SerializedPatternBrush;

export type Compressed = {[key:string]:CompressedValue};
export type CompressedValue = number | string | boolean | Compressed | CompressedOject  | CompressedValue[];

export type Serialized = {[key:string]:SerializedValue};
export type SerializedValue = number | string | boolean | Serialized | SerializedImageData | SerializedValue[];

export function isNumberArray(value: any[]): value is number[] {
    if (value.some(x=>typeof x !== 'number')) return false;
    return true;
}

export function isSerializedImageData(value: SerializedValue): value is SerializedImageData {
    if(typeof value == 'number') return false;
    if(typeof value == 'string') return false;
    if(typeof value == 'boolean') return false;
    if(Array.isArray(value)) return false;
    if (typeof value.colorSpace !== 'string') return false;
    if (!Array.isArray(value.data))return false;
    if (!isNumberArray(value.data)) return false;
    if (typeof value.height !== 'number') return false;
    if (typeof value.width !== 'number') return false;
    return true;
}

export function isCompressedObject(value: Compressed | CompressedOject): value is CompressedOject {
    if (typeof value.type !== 'string') return false;
    if (typeof value.value !== 'string') return false;
    return true;
}
export function isCompressedImageData(value: Compressed | CompressedOject): value is CompressedImage {
    if(!isCompressedObject(value)) return false;
    if (value.type !== 'img') return false;
    return true;
}
export function isCompressedJSON(value: Compressed | CompressedOject): value is CompressedJSON {
    if(!isCompressedObject(value)) return false;
    if (value.type !== 'json') return false;
    return true;
}

export function isSerialized(value: SerializedValue): value is Serialized {
    if(typeof value == 'number') return false;
    if(typeof value == 'string') return false;
    if(typeof value == 'boolean') return false;
    if(Array.isArray(value)) return false;
    if(isSerializedImageData(value)) return false;
    return true;
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
function abrComputedBrushToSolid({ angle, hardness, name, roundness, spacing }: AbrComputedBrush): SerializedSolidBrush {
    return { scribbleBrushType: BrushList.Solid, angle, hardness, name, roundness, spacing };
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
