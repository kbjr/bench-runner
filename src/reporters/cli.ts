
import { Reporter } from './reporter';
import { ReporterConfig } from '../config';
import { SuiteResult, BenchmarkOutcome } from '../suite';
import { red, green, yellow } from 'colors/safe';

/**
 * A simple reporter that writes output to stdout as the
 * benchmark is running (optionally with colors)
 */
export class CliReporter extends Reporter {
	protected pass: number = 0;
	protected warn: number = 0;
	protected fail: number = 0;

	protected readonly config: ReporterConfig & {
		colors?: boolean;
	};

	constructor(benchmark, config) {
		super(benchmark, config);

		this._write('\n');
		this._write(`  ${this.benchmark.config.name}\n`);
		this._write(`  ${'='.repeat(this.benchmark.config.name.length)}\n`);
	}

	write(result: SuiteResult) {
		return this.config.colors
			? this.writeColorized(result)
			: this.writeNoColor(result);
	}

	end() : Promise<void> {
		this._write(`\n  Benchmark Complete\n`);

		if (this.config.colors) {
			this._write(`  ${this.pass + green(' pass')}, ${this.warn + yellow(' warn')}, ${this.fail + red(' fail')}\n`);
		}

		else {
			this._write(`  ${this.pass} pass, ${this.warn} warn, ${this.fail} fail\n`);
		}

		return this._end();
	}

	protected writeColorized(result: SuiteResult) {
		let pass = 0;
		let warn = 0;
		let fail = 0;

		const tests: string[] = [ ];

		for (let i = 0; i < result.tests.length; i++) {
			const test = result.tests[i];

			switch (test.outcome) {
				case BenchmarkOutcome.Pass:
					pass++;
					this.pass++;
					tests.push(`   - ${test.result} [${green(test.expectationVariance.formatted)}]`);
					break;

				case BenchmarkOutcome.Warn:
					warn++;
					this.warn++;
					tests.push(`   - ${test.result} [${yellow(test.expectationVariance.formatted)}]`);
					break;

				case BenchmarkOutcome.Fail:
					fail++;
					this.fail++;
					tests.push(`   - ${test.result} [${red(test.expectationVariance.formatted)}]`);
					break;
			}
		}

		this._write(`\n  Suite: ${result.name} (${pass + green(' pass')}, ${warn + yellow(' warn')}, ${fail + red(' fail')})\n`);
		this._write(`${tests.join('\n')}\n`);
	}

	protected writeNoColor(result: SuiteResult) {
		let pass = 0;
		let warn = 0;
		let fail = 0;

		const tests: string[] = [ ];

		for (let i = 0; i < result.tests.length; i++) {
			const test = result.tests[i];

			switch (test.outcome) {
				case BenchmarkOutcome.Pass:
					pass++;
					this.pass++;
					tests.push(`   - ${test.result} [${test.expectationVariance.formatted}]`);
					break;

				case BenchmarkOutcome.Warn:
					warn++;
					this.warn++;
					tests.push(`   - ${test.result} [${test.expectationVariance.formatted}]`);
					break;

				case BenchmarkOutcome.Fail:
					fail++;
					this.fail++;
					tests.push(`   - ${test.result} [${test.expectationVariance.formatted}]`);
					break;
			}
		}

		this._write(`\n  Suite: ${result.name} (${pass} pass, ${warn} warn, ${fail} fail)\n`);
		this._write(`${tests.join('\n')}\n`);
	}
}
