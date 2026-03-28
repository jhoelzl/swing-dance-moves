export default {
	extends: ['stylelint-config-standard'],
	ignoreFiles: ['build/**', '.svelte-kit/**', 'node_modules/**'],
	rules: {
		'import-notation': null,
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['custom-variant']
			}
		]
	}
};