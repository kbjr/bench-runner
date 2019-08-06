
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

		console.log();
		console.log('  ' + this.benchmark.config.name);
		console.log('  ' + '='.repeat(this.benchmark.config.name.length));
	}

	write(result: SuiteResult) {
		return this.config.colors
			? this.writeColorized(result)
			: this.writeNoColor(result);
	}

	end() : Promise<void> {
		return new Promise((resolve) => {
			console.log('\n  Benchmark Complete');

			if (this.config.colors) {
				console.log(`  ${this.pass + green(' pass')}, ${this.warn + yellow(' warn')}, ${this.fail + red(' fail')}`);
			}

			else {
				console.log(`  ${this.pass} pass, ${this.warn} warn, ${this.fail} fail`);
			}

			// This just causes the promise to resolve once all things previously
			// written to stdout have been flushed
			process.stdout.write('\n', () => resolve());
		});
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
					tests.push(green(`   - ${test.result}`));
					break;

				case BenchmarkOutcome.Warn:
					warn++;
					this.warn++;
					tests.push(yellow(`   - ${test.result}`));
					break;

				case BenchmarkOutcome.Fail:
					fail++;
					this.fail++;
					tests.push(red(`   - ${test.result}`));
					break;
			}
		}

		console.log(`\n  Suite: ${result.name} (${pass + green(' pass')}, ${warn + yellow(' warn')}, ${fail + red(' fail')})`);
		console.log(tests.join('\n'));
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
					tests.push(`   - ${test.result}`);
					break;

				case BenchmarkOutcome.Warn:
					warn++;
					this.warn++;
					tests.push(`   - ${test.result}`);
					break;

				case BenchmarkOutcome.Fail:
					fail++;
					this.fail++;
					tests.push(`   - ${test.result}`);
					break;
			}
		}

		console.log(`\n  Suite: ${result.name} (${pass} pass, ${warn} warn, ${fail} fail)`);
		console.log(tests.join('\n'));
	}
}
