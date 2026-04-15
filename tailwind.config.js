/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './products/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':       'var(--color-bg-base)',
        'bg-surface':    'var(--color-bg-surface)',
        'bg-card':       'var(--color-bg-card)',
        'bg-hover':      'var(--color-bg-hover)',
        'border-default':'var(--color-border)',
        'amber':         'var(--color-amber)',
        'amber-glow':    'var(--color-amber-glow)',
        'cyan':          'var(--color-cyan)',
        'pink-neon':     'var(--color-pink)',
        'purple-neon':   'var(--color-purple)',
        'text-primary':  'var(--color-text-primary)',
        'text-muted':    'var(--color-text-muted)',
        'text-faint':    'var(--color-text-faint)',
        'text-mono':     'var(--color-text-mono)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
};
