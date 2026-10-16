// Normalizes SCL icon SVG snapshots across platforms.
// On macOS, MUI SvgIcon renders icons with full MUI class names, aria-hidden, viewBox and path children.
// On Ubuntu CI, the same library renders a plain self-closing SVG with only the base SCL classes.
// This serializer replaces any SCL icon SVG with a self-closing <svg> that keeps only the
// non-MUI-SvgIcon class names, so snapshots are identical on all platforms.
const sclIconSerializer = {
  test(val: unknown): boolean {
    if (typeof val !== 'object' || val === null) return false;
    const el = val as Element;
    return (
      typeof el.nodeType === 'number' &&
      el.nodeType === 1 &&
      typeof el.tagName === 'string' &&
      el.tagName.toLowerCase() === 'svg' &&
      typeof el.classList?.contains === 'function' &&
      el.classList.contains('SCL-Icon')
    );
  },

  print(val: unknown, _print: (v: unknown) => string, indent: (s: string) => string): string {
    const el = val as Element;
    const normalizedClasses = Array.from(el.classList)
      .filter(c => !c.match(/^MuiSvgIcon-/) && !c.match(/^css-[a-z0-9]+-/))
      .join(' ');
    return `<svg\n${indent(`class="${normalizedClasses}"`)}\n/>`;
  }
};

export default sclIconSerializer;
