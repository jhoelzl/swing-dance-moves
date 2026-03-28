export default {
	extends: ['stylelint-config-standard'],
	ignoreFiles: ['build/**', '.svelte-kit/**', 'node_modules/**'],
	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['custom-variant']
			}
		]
	}
};