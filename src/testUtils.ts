export function runImmediate(): Promise<void> {
    return new Promise(resolve => setImmediate(resolve));
}