export function binarySearch(target: number, arr: number[]): number {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = (low + high) >>> 1; // unsigned right shift = fast floor divide by 2
        if (arr[mid] === target) return mid;
        if (arr[mid]! < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // not found
}
