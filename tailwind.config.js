/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './thank-you.html',
    './products/*.html',
  ],
  safelist: [
    // 由 JS 动态添加、HTML 中未静态出现的 Tailwind 工具类
    'rotate-180',
    'text-orange-600',
    'text-gray-700',
    'bg-orange-50/50',
    'ring-2',
    'ring-red-500',
    'ring-offset-2',
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'steel-gray': '#1C1917',
        'deep-blue': '#0C0A09',
        'accent': {
          DEFAULT: '#C2410C',
          light: '#EA580C',
          dark: '#9A3412',
        },
      },
      borderRadius: {
        'DEFAULT': '0px',
      },
    },
  },
  plugins: [],
};
