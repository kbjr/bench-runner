
// const { suite } = require('../build');

// const smallArray = Array.from({ length: 1000 }, (_, i) => i);
// const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

// suite('Array.map', {
// 	'Small Array (1000)': () => {
// 		smallArray.map((x) => x * 2);
// 	},
// 	'Large Array (1000000)': () => {
// 		largeArray.map((x) => x * 2);
// 	}
// });
/*
const { suite } = require('../build');

const smallArray = Array.from({ length: 1000 }, (_, i) => i);
const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

suite('Array.map', () => {
	suite.before(() => {
		// console.log('suite.before');
	});

	suite.test('Small Array (1000)', {
		test(data) {
			data.map((x) => x * 2);
		},

		before() {
			// console.log('suite.test.before');
		},

		generateData() {
			return Array.from({ length: 1000 }, (_, i) => i);
		}
	});

	suite.test('Large Array (1000000)', () => {
		largeArray.map((x) => x * 2);
	});
});
*/