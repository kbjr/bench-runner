
const { suite } = require('../build');

const smallArray = Array.from({ length: 1000 }, (_, i) => i);
const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

suite('Array.forEach', {
	'Small Array (1000)': () => {
		smallArray.forEach(() => { });
	},
	'Large Array (1000000)': () => {
		largeArray.forEach(() => { });
	}
});
