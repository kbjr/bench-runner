
import { Suite as BenchmarkSuite } from 'benchmark';

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

export class Suite {
	public readonly name: string;
	public readonly suite: BenchmarkSuite;
	public readonly config: SuiteConfig;

	constructor(name: string, config: SuiteConfig) {
		this.name = name;
		this.suite = new BenchmarkSuite();
		this.config = config;
	}

	add(name: string, callback: () => void) : void {
		this.suite.add(name, callback);
	}

	run() : Promise<SuiteResult> {
		return new Promise((resolve) => {
			const result: SuiteResult = {
				name: this.name,
				tests: [ ],
				outcome: null
			};
			
			const expectations = this.config.expectations || { };

			let hasWarn = false;
			let hasFail = false;

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
					expectationVariance: formatHz(variance),
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
		formatted: `${Math.abs(percent).toFixed(2)}%`
	};
};
