export function roundedClamp(val, min, max) {
    return clamp(Math.round(val), min,max)
}

export function clamp(val, min, max) {

    return Math.max(Math.min(val, max), min)

}