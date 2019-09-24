
import { Suite as BenchmarkSuite } from 'benchmark';

const dataSampleSize = 100;

export enum BenchmarkOutcome {
	None = -1,
	Pass,
	Warn,
	Fail
}

export interface TestResult {
	name: string;
	result: string;
	hz: Stat;
	expectation: Stat;
	expectationVariance: Stat;
	outcome: BenchmarkOutcome;
	variance: Stat;
	runsSampled: number;
}

export interface SuiteResult {
	name: string;
	tests: TestResult[];
	outcome: BenchmarkOutcome;
}

export interface Stat {
	raw: number;
	formatted: string;
}

export interface SuiteConfig {
	warnThreshold: number;
	failThreshold: number;
	expectations: {
		[testName: string]: number;
	}
}

export interface TestCallback<D> {
	(data?: D): void;

	/** Internal function stored on the test function */
	before?: Function;

	/** Internal function stored on the test function */
	generateData?: Function;
}

export interface BeforeCallback {
	(): void | Promise<void>;
}

export interface BeforeTestCallback {
	(): void;
}

export interface GenerateTestDataCallback<D> {
	(): D;
}

export interface GenerateTestDataArrayCallback<D> {
	(): D[];
}

export interface TestOptions<D> {
	before?: BeforeTestCallback;
	generateData?: GenerateTestDataCallback<D>;
	generateDataArray?: GenerateTestDataArrayCallback<D>;
}

export class Suite {
	public readonly name: string;
	public readonly suite: BenchmarkSuite;
	public readonly config: SuiteConfig;
	public readonly beforeCallbacks: BeforeCallback[] = [ ];
	public readonly dataGenerators: Function[] = [ ];

	constructor(name: string, config: SuiteConfig) {
		this.name = name;
		this.suite = new BenchmarkSuite();
		this.config = config;
	}

	add<D>(name: string, callback: TestCallback<D>, opts?: TestOptions<D>) : void {
		const wrapped = wrapCallback(callback, opts);

		if (wrapped.generateData) {
			this.dataGenerators.push(wrapped.generateData);
		}

		this.suite.add(name, wrapped);
	}

	before(callback: BeforeCallback) : void {
		this.beforeCallbacks.push(callback);
	}

	run() : Promise<SuiteResult> {
		return new Promise(async (resolve) => {
			const result: SuiteResult = {
				name: this.name,
				tests: [ ],
				outcome: null
			};
			
			const expectations = this.config.expectations || { };

			let hasWarn = false;
			let hasFail = false;

			// Call any global before callbacks
			for (let i = 0; i < this.beforeCallbacks.length; i++) {
				await this.beforeCallbacks[i]();
			}

			// Call any data generators
			for (let i = 0; i < this.dataGenerators.length; i++) {
				this.dataGenerators[i]();
			}

			this.suite.on('cycle', (event) => {
				const expectation = expectations[event.target.name] || 0;
				const variance = expectations[event.target.name]
					? event.target.hz / expectations[event.target.name]
					: 1;

				const testResult: TestResult = {
					name: event.target.name,
					result: event.target.toString(),
					hz: formatHz(event.target.hz),
					expectation: formatHz(expectation),
					expectationVariance: formatExpectationVariance(variance),
					outcome: null,
					variance: formatVariance(event.target.stats.rme),
					runsSampled: event.target.stats.sample.length
				};

				const warnThreshold = expectation * this.config.warnThreshold;
				const failThreshold = expectation * this.config.failThreshold;

				if (event.target.hz >= warnThreshold) {
					testResult.outcome = BenchmarkOutcome.Pass;
				}

				else if (event.target.hz >= failThreshold) {
					testResult.outcome = BenchmarkOutcome.Warn;
					hasWarn = true;
				}

				else {
					testResult.outcome = BenchmarkOutcome.Fail;
					hasFail = true;
				}

				result.tests.push(testResult);
			});

			this.suite.on('complete', () => {
				if (hasFail) {
					result.outcome = BenchmarkOutcome.Fail;
				}

				else if (hasWarn) {
					result.outcome = BenchmarkOutcome.Warn;
				}

				else {
					result.outcome = BenchmarkOutcome.Pass;
				}

				resolve(result);
			});

			this.suite.run();
		});
	}
}

const formatHz = (raw: number) : Stat => {
	return {
		raw: raw,
		formatted: Math.round(raw).toLocaleString('fullwide')
	};
};

const formatVariance = (raw: number) : Stat => {
	return {
		raw: raw,
		formatted: `+/-${raw.toPrecision(3)}%`
	};
};

const formatExpectationVariance = (variance: number) : Stat => {
	const percent = (variance - 1) * 100;
	const sign = percent < 0 ? '-' : '+';

	return {
		raw: percent,
		formatted: `${sign}${Math.abs(percent).toFixed(2)}%`
	};
};

/**
 * Wraps a test callback to enable support for `before` and `generateData` callbacks
 */
const wrapCallback = <D>(callback: TestCallback<D>, opts: TestOptions<D>) : TestCallback<void> => {
	if (! opts || ! opts.before && ! opts.generateData && ! opts.generateDataArray) {
		return callback as any;
	}

	let data: D[];
	let dataIndex = 0;
	let wrapped: TestCallback<void>;
	let callbackWithData: TestCallback<void>;
	let result: TestCallback<void> = () => wrapped();

	// First, handle any data generation by defining the `reuslt.generateData` method to
	// handle whichever data generator is available

	if (opts.generateDataArray) {
		result.generateData = () => {
			data = opts.generateDataArray();
		};
			
		callbackWithData = () => {
			callback(data[dataIndex]);

			if (dataIndex >= data.length) {
				dataIndex = 0;
			}
		};
	}

	else if (opts.generateData) {
		data = new Array(dataSampleSize);

		result.generateData = () => {
			for (let i = 0; i < dataSampleSize; i++) {
				data[i] = opts.generateData();
			}
		};

		callbackWithData = () => {
			callback(data[dataIndex]);

			if (dataIndex >= dataSampleSize) {
				dataIndex = 0;
			}
		};
	}

	// Bind the before function is needed

	if (opts.before) {
		if (result.generateData) {
			wrapped = () => {
				// We only want to call before once, so after the first call, we immediately replace the
				// wrapped callback with one that doesn't call before
				wrapped = callbackWithData;

				opts.before();
				callbackWithData();
			};
		}

		else {
			wrapped = () => {
				// We only want to call before once, so after the first call, we immediately replace the
				// wrapped callback with one that doesn't call before
				wrapped = callback as any;

				opts.before();
			};
		}
	}

	// Otherwise our wrapped function is just the function that selects from data

	else {
		wrapped = callbackWithData;
	}

	return result;
};
