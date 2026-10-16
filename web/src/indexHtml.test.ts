import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML_PATH = resolve(__dirname, '../index.html');

describe('index.html', () => {
  let html: string;

  beforeAll(() => {
    html = readFileSync(INDEX_HTML_PATH, 'utf-8');
  });

  it('has default title of AAA | Auto EFNOL', () => {
    expect(html).toContain('<title>AAA | Auto EFNOL</title>');
  });

  it('sets W Insurance title via inline script before TMS loader', () => {
    expect(html).toContain('File an Insurance Claim | W Insurance');
    expect(html).toContain("sessionStorage.getItem('brand')");
    // Title assignment must appear before the TMS loader
    const titlePos = html.indexOf('File an Insurance Claim | W Insurance');
    const tmsLoaderPos = html.indexOf('utag.sync.js');
    expect(titlePos).toBeLessThan(tmsLoaderPos);
  });

  it('includes AAA TMS utag sync script in conditional loader', () => {
    expect(html).toContain('tms.ace.aaa.com/ace/prod/utag.sync.js');
  });

  it('includes WInsurance TMS utag sync script in conditional loader', () => {
    expect(html).toContain('tms.w-insurance.com/wins/prod/utag.sync.js');
  });

  it('selects utag sync script based on isW URL parameter', () => {
    expect(html).toContain("get('isW')");
  });

  it('includes mobile bridge loader script', () => {
    expect(html).toContain('mobileBridgeLoader');
    expect(html).toMatch(/<script[^>]*src="[^"]*mobileBridgeLoader[^"]*"[^>]*>/i);
  });

  it('references ace-js-bridge in loader (via module)', () => {
    // The mobile bridge is loaded dynamically by mobileBridgeLoader.ts.
    // Verify the loader module is present so the bridge will be injected.
    expect(html).toContain('mobileBridgeLoader.ts');
  });

  it('has default favicon pointing to favicon.png', () => {
    expect(html).toMatch(/<link rel="icon"[^>]*href="[^"]*favicon\.png"/);
    expect(html).toMatch(/<link rel="icon"[^>]*type="image\/png"/);
  });

  it('sets WInsurance favicon via inline script based on isW', () => {
    expect(html).toContain('winsurance-favicon.svg');
    // Favicon update must appear before the TMS loader
    const faviconPos = html.indexOf('winsurance-favicon.svg');
    const tmsLoaderPos = html.indexOf('utag.sync.js');
    expect(faviconPos).toBeLessThan(tmsLoaderPos);
  });

  it('injects robots noindex meta tag for WInsurance via inline script', () => {
    expect(html).toContain("robotsMeta.name = 'robots'");
    expect(html).toContain("robotsMeta.content = 'noindex, nofollow'");
  });

  it('robots meta injection appears before TMS loader', () => {
    const robotsPos = html.indexOf("robotsMeta.name = 'robots'");
    const tmsLoaderPos = html.indexOf('utag.sync.js');
    expect(robotsPos).toBeLessThan(tmsLoaderPos);
  });

  it('robots meta injection is conditional on isW', () => {
    const isWCheckPos = html.indexOf('var isW');
    const robotsPos = html.indexOf("robotsMeta.name = 'robots'");
    expect(isWCheckPos).toBeLessThan(robotsPos);
  });

  it('includes localStorage urlParams fallback for isW detection', () => {
    expect(html).toContain("localStorage.getItem('urlParams')");
  });

  it('has root div for React app', () => {
    expect(html).toContain('id="root"');
  });

  it('has main app script', () => {
    expect(html).toContain('main.tsx');
  });
});

describe('index.html inline script — runtime behavior', () => {
  let scriptBody: string;

  const extractInlineScript = (rawHtml: string): string => {
    const match = rawHtml.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
    return match?.[1] ?? '';
  };

  const runScript = () => {
    // eslint-disable-next-line no-eval
    eval(scriptBody);
  };

  const resetDom = () => {
    document.querySelectorAll('meta[name="robots"]').forEach((el) => el.remove());
    document.title = 'AAA | Auto EFNOL';
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.setAttribute('href', '/favicon.png');
    link.setAttribute('type', 'image/png');
  };

  beforeAll(() => {
    const html = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../index.html'), 'utf-8');
    scriptBody = extractInlineScript(html);
  });

  beforeEach(() => {
    resetDom();
    sessionStorage.clear();
    localStorage.clear();
    vi.spyOn(document, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('injects robots meta for isW=true in URL', () => {
    Object.defineProperty(window, 'location', { value: { search: '?isW=true' }, configurable: true });
    runScript();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('does not inject robots meta for AAA (no isW)', () => {
    Object.defineProperty(window, 'location', { value: { search: '' }, configurable: true });
    runScript();
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('injects robots meta when brand=WInsurance in sessionStorage', () => {
    Object.defineProperty(window, 'location', { value: { search: '' }, configurable: true });
    sessionStorage.setItem('brand', 'WInsurance');
    runScript();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('injects robots meta when isW=true is persisted in localStorage urlParams (no current query)', () => {
    Object.defineProperty(window, 'location', { value: { search: '' }, configurable: true });
    localStorage.setItem('urlParams', 'isW=true');
    runScript();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('does not use localStorage fallback when current URL has a non-isW query string', () => {
    Object.defineProperty(window, 'location', { value: { search: '?clubCode=062' }, configurable: true });
    localStorage.setItem('urlParams', 'isW=true');
    runScript();
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.title).toBe('AAA | Auto EFNOL');
  });

  it('sets W Insurance title for isW=true', () => {
    Object.defineProperty(window, 'location', { value: { search: '?isW=true' }, configurable: true });
    runScript();
    expect(document.title).toBe('File an Insurance Claim | W Insurance');
  });

  it('sets AAA title when no isW', () => {
    Object.defineProperty(window, 'location', { value: { search: '' }, configurable: true });
    runScript();
    expect(document.title).toBe('AAA | Auto EFNOL');
  });

  it('loads W Insurance Tealium script for isW=true', () => {
    Object.defineProperty(window, 'location', { value: { search: '?isW=true' }, configurable: true });
    runScript();
    expect(document.write).toHaveBeenCalledWith(expect.stringContaining('tms.w-insurance.com'));
  });

  it('loads AAA Tealium script when no isW', () => {
    Object.defineProperty(window, 'location', { value: { search: '' }, configurable: true });
    runScript();
    expect(document.write).toHaveBeenCalledWith(expect.stringContaining('tms.ace.aaa.com'));
  });
});
