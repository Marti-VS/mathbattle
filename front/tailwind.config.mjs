/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require('@iconify/tailwind')
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			keyframes: {
				moveAndRotate: {
					'0%': {
						transform: 'translateX(-20px) rotate(-5deg)'
					},

					'50%': {
						transform: 'translateX(20px) rotate(5deg)'
					},

					'100%': {
						transform: 'translateX(-20px) rotate(-5deg)'
					}
				},
				pulse512: {
					'0%': {
						boxShadow: '0 0 0 0 #05bada66'
					},

					'70%': {
						boxShadow: '0 0 0 10px rgb(218 103 68 / 0%)'
					},

					'100%': {
						boxShadow: '0 0 0 0 rgb(218 103 68 / 0%)'
					}
				}
			}
		},
	},
	plugins: [addDynamicIconSelectors()],
}
