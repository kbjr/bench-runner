
const { suite } = require('../build');

const smallArray = Array.from({ length: 1000 }, (_, i) => i);
const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

suite('Array.map', {
	'Small Array (1000)': () => {
		smallArray.map((x) => x * 2);
	},
	'Large Array (1000000)': () => {
		largeArray.map((x) => x * 2);
	}
});
