/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ============================================
    // Responsive Breakpoints - Mobile First
    // ============================================
    screens: {
      'xs': '475px',      // Small mobile
      'sm': '640px',      // Large mobile / Small tablet
      'md': '768px',      // Tablet portrait
      'lg': '1024px',     // Tablet landscape / Small laptop
      'xl': '1280px',     // Desktop
      '2xl': '1440px',    // Large desktop
      '3xl': '1680px',    // Extra large screens
    },

    extend: {
      // ============================================
      // EU AI Act Audit Design System Colors
      // ============================================
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

      // ============================================
      // Typography - Improved Readability
      // ============================================
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['IBM Plex Serif', 'Georgia', 'serif'],
        'mono': ['IBM Plex Mono', 'Consolas', 'monospace'],
      },

      // Enhanced font sizes with responsive clamp values
      fontSize: {
        // Display headings (rarely used, for hero sections)
        'display': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '700' }],

        // Heading sizes - increased for better readability
        'h1': ['clamp(1.625rem, 2.5vw, 2rem)', { lineHeight: '1.3', fontWeight: '600' }],      // 26-32px
        'h2': ['clamp(1.375rem, 2vw, 1.625rem)', { lineHeight: '1.35', fontWeight: '600' }],   // 22-26px
        'h3': ['clamp(1.125rem, 1.5vw, 1.375rem)', { lineHeight: '1.4', fontWeight: '500' }],  // 18-22px
        'h4': ['clamp(1rem, 1.25vw, 1.125rem)', { lineHeight: '1.45', fontWeight: '500' }],    // 16-18px

        // Body text - slightly larger base
        'body': ['clamp(0.9375rem, 1vw, 1.0625rem)', { lineHeight: '1.65' }],                  // 15-17px
        'body-lg': ['clamp(1rem, 1.1vw, 1.125rem)', { lineHeight: '1.7' }],                    // 16-18px

        // UI elements
        'label': ['clamp(0.8125rem, 0.9vw, 0.9375rem)', { lineHeight: '1.4', fontWeight: '500' }], // 13-15px
        'meta': ['clamp(0.75rem, 0.85vw, 0.875rem)', { lineHeight: '1.35' }],                  // 12-14px
        'legal': ['clamp(0.875rem, 1vw, 1rem)', { lineHeight: '1.6' }],                        // 14-16px

        // Small text
        'xs': ['0.75rem', { lineHeight: '1.3' }],                                              // 12px
        'sm': ['0.875rem', { lineHeight: '1.4' }],                                             // 14px
        'base': ['1rem', { lineHeight: '1.6' }],                                               // 16px
        'lg': ['1.125rem', { lineHeight: '1.55' }],                                            // 18px
        'xl': ['1.25rem', { lineHeight: '1.5' }],                                              // 20px
      },

      // ============================================
      // Spacing & Layout
      // ============================================
      spacing: {
        '18': '4.5rem',
        '20': '5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      // Height values
      height: {
        '18': '4.5rem',
        '20': '5rem',
      },

      // Container configuration for fluid layouts
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
          '2xl': '4rem',
        },
      },

      // Max widths for content
      maxWidth: {
        'prose': '75ch',
        'form': '32rem',         // 512px
        'form-lg': '40rem',      // 640px
        'content': '90rem',      // 1440px
        'dashboard': '100rem',   // 1600px
      },

      // ============================================
      // Visual Design Tokens
      // ============================================

      // Border radius
      borderRadius: {
        'audit': '0.5rem',        // Slightly larger for modern feel
        'audit-lg': '0.75rem',
        'audit-xl': '1rem',
      },

      // Box shadows - subtle and professional
      boxShadow: {
        'audit': '0 1px 3px 0 rgba(43, 61, 79, 0.08), 0 1px 2px -1px rgba(43, 61, 79, 0.08)',
        'audit-md': '0 4px 6px -1px rgba(43, 61, 79, 0.08), 0 2px 4px -2px rgba(43, 61, 79, 0.06)',
        'audit-lg': '0 10px 15px -3px rgba(43, 61, 79, 0.08), 0 4px 6px -4px rgba(43, 61, 79, 0.06)',
        'audit-inner': 'inset 0 2px 4px 0 rgba(43, 61, 79, 0.05)',
      },

      // Line heights
      lineHeight: {
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '1.75',
        'readable': '1.65',       // Optimal for body text
      },

      // Letter spacing
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.015em',
        'normal': '0',
        'wide': '0.015em',
        'wider': '0.03em',
        'widest': '0.08em',
      },

      // Grid template columns for responsive layouts
      gridTemplateColumns: {
        'auto-fill-sm': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-md': 'repeat(auto-fill, minmax(300px, 1fr))',
        'auto-fill-lg': 'repeat(auto-fill, minmax(350px, 1fr))',
        'dashboard': 'repeat(auto-fit, minmax(280px, 1fr))',
      },

      // Animation
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
