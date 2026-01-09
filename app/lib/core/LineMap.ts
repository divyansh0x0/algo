export class LineMap {
    private LineMap: number[] = [];
    push(pos: number) {
        this.LineMap.push(pos);
    }
    getLineNumber(pos: number): number {
        let low = 0;
        let high = this.LineMap.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (this.LineMap[mid]! <= pos) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return high + 1; // 1-based line number
    }
    getLine(offset: number): number {
        let low = 0;
        let high = this.LineMap.length - 1;

        while (low <= high) {
            const mid = (low + high) >>> 1; // unsigned right shift = fast floor divide by 2
            if (this.LineMap[mid] === offset) return mid;
            if (this.LineMap[mid]! < offset) low = mid + 1;
            else high = mid - 1;
        }
        return -1; // not found
    }
    indexToLineCol(offset: number): [ number, number ] {
        const line = this.getLine(offset);
        const col = offset - this.LineMap[line]!;
        return [ line, col ];
    }
}