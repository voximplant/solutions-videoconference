function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => fn.apply(this, args), delay);
  } as F;
}

export { debounce };
