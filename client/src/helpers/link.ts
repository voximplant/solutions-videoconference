export function getLink(): string {
  return location.href;
}

export function getPin(): string {
  let pin = '';
  const match = location.href.match(/(?:\/)\d+$/);
  if (match !== null) {
    pin = match[0];
  }
  return pin;
}
