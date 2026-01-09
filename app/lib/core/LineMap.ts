export class LineMap {
    private LineMap: number[] = [];
    push(pos: number) {
        this.LineMap.push(pos);
    }
    getLine(pos: number): number {
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
    indexToLineCol(offset: number): [ number, number ] {
        const line = this.getLine(offset);
        const col = offset - this.LineMap[line]!;
        return [ line, col ];
    }
}