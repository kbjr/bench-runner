
import { Reporter } from './reporter';
import { ReporterConfig } from '../config';
import { SuiteResult, BenchmarkOutcome } from '../suite';
import { red, green, yellow } from 'colors/safe';
import { hostname } from 'os';

/**
 * Reporter that writes output to a file in JUnit format
 */
export class JunitReporter extends Reporter {
	protected pass: number = 0;
	protected warn: number = 0;
	protected fail: number = 0;

	protected testsuites: string[] = [ ];

	protected readonly config: ReporterConfig & {
		colors?: boolean;
	};

	constructor(benchmark, config) {
		super(benchmark, config);
	}

	write(result: SuiteResult) {
		const failures = result.tests.reduce((count, test) => count + (test.outcome === BenchmarkOutcome.Fail ? 1 : 0), 0);

		this.testsuites.push(`
			<testsuite classname="${result.name}" tests="${result.tests.length}" failures="${failures}" time="${result.time.raw / 1000}">
				${result.tests.map((test) => `
					<testcase classname="${result.name}" name="${test.name}" time="${test.time.raw / 1000}">
						${test.outcome === BenchmarkOutcome.Fail
							? `<failure message="${test.result} [${test.expectationVariance.formatted}]"></failure>`
							: `<system-out>${test.result} [${test.expectationVariance.formatted}]</system-out>`
						}
					</testcase>
				`).join('\n')}
			</testsuite>
		`);
	}

	end() : Promise<void> {
		const count = this.pass + this.warn + this.fail;
		const xml = `
			<testsuites errors="0" failures=${this.fail} name="${this.benchmark.config.name}" tests="${count}" hostname="${hostname()}">
				${this.testsuites.join('\n')}
			</testsuites>
		`;

		this._write(xml);

		return this._end();
	}
}
