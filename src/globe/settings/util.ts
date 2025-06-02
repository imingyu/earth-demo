export const getTypeValue = <T = object>(obj: unknown, prop: keyof T) => {
    return (obj as T)[prop]
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformTypeValue = <T extends object, R = any>(obj: unknown, transformer: (obj: T) => R): R => {
    return transformer(obj as T)
}