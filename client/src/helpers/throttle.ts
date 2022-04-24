type ThrottledFunction<Args extends unknown[], F extends (...args: Args) => unknown> = (
  this: ThisParameterType<F>,
  ...args: Args & Parameters<F>
) => void;

export const throttle = <Args extends unknown[], F extends (...args: Args) => unknown>(
  fn: F,
  time: number
): ThrottledFunction<Args, F> => {
  let inThrottle = false;
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    if (!inThrottle) {
      fn.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), time);
    }
  };
};
