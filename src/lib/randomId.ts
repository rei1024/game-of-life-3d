export function randomId() {
  // httpで使用できない場合
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16);
}
