// utility function to create function with timeout, used in ga events
export function actWithTimeOut(callback: () => void, optTimeout: number | undefined) {
  let called = false;
  function fn() {
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, optTimeout || 1000);
  return fn;
}
