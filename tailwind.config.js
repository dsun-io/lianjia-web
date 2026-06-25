/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './thank-you.html',
    './products/*.html',
    './blog/*.html',
    './privacy.html',
    './assets/js/*.js',
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
    // 颜色 token：确保这些工具类在编译后存在
    'text-heading',
    'text-accent-bright',
    'border-accent-bright',
    'ring-accent-bright',
    'stroke-accent-bright',
    'bg-whatsapp',
    'hover:bg-whatsapp-hover',
    // 视觉收敛后显式使用的 orange 工具类
    'bg-orange-500',
    'hover:bg-orange-600',
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
        'heading': '#2D3436',
        'accent': {
          DEFAULT: '#f97316', // orange-500
          light: '#f97316',
          dark: '#ea580c',    // orange-600
          bright: '#f97316',
        },
        'whatsapp': {
          DEFAULT: '#25D366',
          hover: '#128C7E',
        },
      },
      borderRadius: {
        'DEFAULT': '0px',
      },
    },
  },
  plugins: [],
};
