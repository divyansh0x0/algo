enum PieceType {
    ORIGINAL,
    ADD,
}

interface Piece {
    type: PieceType;
    start: number;
    length: number;
}

export class IDEDocument {
    private lineOffsets: number[] = [];
    private readonly original_buffer: string;
    private add_buffer: string    = "";
    private pieces: Piece[]       = [];

    constructor(original: string = "") {
        this.original_buffer = original;
        if (original.length > 0) {
            this.pieces.push({
                type  : PieceType.ORIGINAL,
                start : 0,
                length: original.length
            });
        }
    }

    insert(index: number, text: string) {
        const prev_add_buffer_length = this.add_buffer.length;
        this.add_buffer += text;

        let curr_pos = 0;
        if (index <= 0) {
            this.pieces.splice(0, 0, {
                type  : PieceType.ADD,
                start : index,
                length: text.length
            });
            return;
        }
        if (index >= this.getContentLength()) {
            this.pieces.push({
                type  : PieceType.ADD,
                start : this.getContentLength(),
                length: text.length
            });
            return;
        }
        for (let i = 0; i < this.pieces.length; i++) {
            const piece   = this.pieces[i];
            const new_pos = piece.length + curr_pos;


            if (new_pos > index) { // piece found

                // position inside piece
                const piece_offset        = index - curr_pos;
                //if inside piece then split the piece
                const new_pieces: Piece[] = [];
                // left piece
                if (piece_offset > 0) {
                    new_pieces.push({
                        type  : piece.type,
                        start : piece.start,
                        length: piece_offset
                    });
                }
                // added piece
                new_pieces.push({
                    type  : PieceType.ADD,
                    start : prev_add_buffer_length,
                    length: text.length
                });
                // right piece
                if (piece_offset < piece.length) {
                    new_pieces.push({
                        type  : piece.type,
                        start : piece.start + piece_offset,
                        length: piece.length - piece_offset
                    });
                }
                this.pieces.splice(i, 1, ...new_pieces);
                return;
            }
            curr_pos = new_pos;
        }
    }

    delete(start: number, end: number) {

    }

    replace(start: number, end: number) {

    }

    getContent(): string {
        let content = "";
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            switch (piece.type) {
                case PieceType.ADD:
                    content += this.add_buffer.substring(piece.start, piece.start + piece.length);
                    break;
                case PieceType.ORIGINAL:
                    content += this.original_buffer.substring(piece.start, piece.start + piece.length);
                    break;
            }
        }
        return content;
    }

    private getContentLength(): number {
        let len = 0;
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            len += piece.length;
        }
        return len;
    }
}


const doc = new IDEDocument("");
doc.insert(0, "Hello\n");
console.log(doc.getContent());
doc.insert(6, "World");
console.log(doc.getContent());
doc.insert(1, "!!!");
console.log(doc.getContent());
