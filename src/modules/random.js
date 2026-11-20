export function getRandomResult() {
  const randomByte = new Uint8Array(1);
  globalThis.crypto.getRandomValues(randomByte);
  return (randomByte[0] & 1) === 0 ? "cara" : "cruz";
}
