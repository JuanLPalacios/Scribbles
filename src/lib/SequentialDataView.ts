
export class SequentialDataView {
    dataView: DataView;
    offset: number;

    constructor(arrayBuffer: ArrayBuffer) {
        this.dataView = new DataView(arrayBuffer);
        this.offset = 0;
    }

    readRawData(buffer: number[], length: number): number {
        while (buffer.length > 0) buffer.pop();
        const pos = this.offset;
        const endPos = this.offset + length;
        while ((!this.atEnd()) && (this.offset < endPos)) {
            buffer.push(this.getUint8());
        }
        return this.offset - pos;
    }
    data() {
        return this.dataView.buffer;
    }
    getPos(): number {
        return this.offset;
    }
    setPos(offset: number) {
        this.offset = offset;
    }
    size(): number {
        return this.dataView.byteLength;
    }
    atEnd(): boolean {
        return this.offset >= this.dataView.byteLength;
    }
    getUint8(): number {
        const pos = this.offset;
        this.offset += 1;
        return this.dataView.getUint8(pos);
    }
    getUint16(): number {
        const pos = this.offset;
        this.offset += 2;
        return this.dataView.getUint16(pos);
    }
    getUint32(): number {
        const pos = this.offset;
        this.offset += 4;
        return this.dataView.getUint32(pos);
    }
    getInt16() {
        const pos = this.offset;
        this.offset += 2;
        return this.dataView.getInt16(pos);
    }
    getChar(): string {
        return String.fromCharCode(this.getUint8());
    }
}
