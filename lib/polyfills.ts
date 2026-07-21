// lib/polyfills.ts
if (typeof window === 'undefined') {
  (global as any).window = {
    location: { pathname: '', href: '', search: '', hash: '', origin: '', protocol: '', host: '', hostname: '', port: '', reload: () => {}, replace: () => {}, assign: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
    navigator: { share: () => {}, clipboard: { writeText: () => Promise.resolve() } },
    document: { createElement: () => ({ click: () => {}, href: '', download: '' }), body: { appendChild: () => {}, removeChild: () => {} } },
    URL: URL,
    fetch: () => Promise.resolve({ blob: () => Promise.resolve(new Blob()), url: '' }),
  } as any;
}

