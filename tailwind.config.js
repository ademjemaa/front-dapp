module.exports = {
	content: [
	  "./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			screens: {
				xs: "475px",
				sm: "768px",
				lg: "1024px",
				xl: "1280px"
			},
			fontFamily: {
				'alts': 'AvenirLTStd, sans-serif',
			}
			
		},
	},
	plugins: [],
}