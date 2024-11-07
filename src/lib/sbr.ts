import JSZip from 'jszip';
import { Serialized, Compressed } from './Serialization';
import { Context, getUnzipDataFunction, SbrVersionInfo, zipDataV1S1 } from './sdrw';

export const SBR = {
    jsonObj(file: File) {
        const zip = new JSZip();
        return zip.loadAsync(file)
            .then((zip)=>
                zip.files['version.json'].async('string')
                    .then(JSON.parse)
                    .then((version:SbrVersionInfo)=>
                        zip.files['content.json'].async('string')
                            .then(JSON.parse)
                            .then(async (zippedBrushes:Compressed[])=>{
                                const context:Context = { zip, types: {} };
                                const unzipDataFunction = getUnzipDataFunction(version);
                                const brushes:Serialized[] = [];
                                for (let i = 0; i < zippedBrushes.length; i++) {
                                    const
                                        zippedBrush:Compressed = zippedBrushes[i],
                                        brush:Serialized = {};
                                    for (const key in zippedBrush) {
                                        if (Object.prototype.hasOwnProperty.call(zippedBrush, key)) {
                                            brush[key] = await unzipDataFunction(zippedBrush[key], context);
                                        }
                                    }
                                    brushes.push(brush);
                                }
                                return brushes;
                            })
                    )
            );
    },

    async binary(brushes: Serialized[]) {
        const zip = new JSZip();
        const dir = zip.folder('img');
        if((!dir))throw new Error('JSZip folder could not be created');
        const version:SbrVersionInfo = {
            version: 1,
            subVersion: 1
        };
        zip.file('version.json', JSON.stringify(version));
        const context = { zip, types: { img: { dir, count: 0 } } };
        const zippedBrushes:Compressed[] = [];
        for (let i = 0; i < brushes.length; i++) {
            const
                brush:Serialized = brushes[i],
                zippedBrush:Compressed = {};
            for (const key in brush) {
                if (Object.prototype.hasOwnProperty.call(brush, key)) {
                    zippedBrush[key] = await zipDataV1S1(brush[key], context);
                }
            }
            zippedBrushes.push(zippedBrush);
        }
        zip.file('content.json', JSON.stringify(zippedBrushes));
        return zip.generateAsync({ type: 'blob' });
    }
};