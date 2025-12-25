/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // EU AI Act Audit Design System Colors
      colors: {
        // Primary palette
        'audit': {
          'deep': '#2B3D4F',      // Deep Blue-Grey - primary text, headings
          'steel': '#354A5F',     // Muted Steel Blue - secondary UI
          'cool': '#5D6D7E',      // Cool Grey - metadata, secondary text
          'light': '#BDC3C7',     // Soft Light Grey - borders, dividers
          'bg': '#EDF1F2',        // Off-White - main background
        },
        // Semantic status colors (using audit palette)
        'status': {
          'info': '#354A5F',
          'success': '#2B3D4F',
          'warning': '#5D6D7E',
          'error': '#354A5F',
        }
      },
      // Typography
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['IBM Plex Serif', 'Georgia', 'serif'],
        'mono': ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Heading sizes
        'h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],    // 28px
        'h2': ['1.375rem', { lineHeight: '1.875rem', fontWeight: '600' }],  // 22px
        'h3': ['1.125rem', { lineHeight: '1.625rem', fontWeight: '500' }],  // 18px
        'h4': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],        // 16px
        // Body sizes
        'body': ['1rem', { lineHeight: '1.6' }],                            // 16px
        'label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // 14px
        'meta': ['0.8125rem', { lineHeight: '1.125rem' }],                  // 13px
        'legal': ['0.9375rem', { lineHeight: '1.5rem' }],                   // 15px
      },
      // Spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      // Max widths for content
      maxWidth: {
        'prose': '75ch',
        'form': '480px',
      },
      // Border radius
      borderRadius: {
        'audit': '0.375rem',
      },
      // Box shadows - subtle and professional
      boxShadow: {
        'audit': '0 1px 3px 0 rgba(43, 61, 79, 0.1), 0 1px 2px -1px rgba(43, 61, 79, 0.1)',
        'audit-lg': '0 4px 6px -1px rgba(43, 61, 79, 0.1), 0 2px 4px -2px rgba(43, 61, 79, 0.1)',
      },
    },
  },
  plugins: [],
}
