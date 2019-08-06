
import { Config } from './config';
import { Profile } from './profile';
import { Suite } from './suite';
import { Reporter } from './reporters/reporter';
import { sync as glob } from 'glob';
import { resolve } from 'path';

export interface SuiteTests {
	[testName: string]: () => void;
}

export class Benchmark {
	public readonly config: Config;
	public readonly profile: Profile;
	public readonly suites: Suite[] = [ ];
	public readonly reporters: Reporter[];

	constructor(config: Config) {
		this.config = config;
		this.profile = config.profile
			? Profile.readFromFile(config.profile)
			: Profile.create();

		this.reporters = this.config.reporters.map((reporter) => {
			if (Array.isArray(reporter)) {
				return new reporter[0](this, reporter[1]);
			}

			return new reporter(this, { });
		});
	}

	add(name: string, tests: SuiteTests) {
		const suiteProfile = this.profile.suites[name] || {
			tests: { }
		};

		const suite = new Suite(name, {
			warnThreshold: this.config.warnThreshold,
			failThreshold: this.config.failThreshold,
			expectations: suiteProfile.tests
		});

		Object.keys(tests).forEach((name) => {
			suite.add(name, tests[name]);
		});

		this.suites.push(suite);
	}

	async run() : Promise<void> {
		const files = resolveFiles(this.config.files);
		
		// Require all of the test files so they can each add their suites
		// to the benchmark
		files.forEach((file) => require(file));

		// Run all the tests suites
		for (let i = 0; i < this.suites.length; i++) {
			const suite = this.suites[i];
			const result = await suite.run();

			this.reporters.forEach((reporter) => {
				reporter.write(result);
			});
		}

		this.reporters.forEach((reporter) => {
			reporter.end();
		});
	}
}

const resolveFiles = (pattern: string | string[]) : string[] => {
	const files: string[] = Array.isArray(pattern)
		? pattern.flatMap((pattern) => glob(pattern))
		: glob(pattern);

	// Unique the list before returning
	return [ ...new Set(files) ].map((file) => {
		return resolve(process.cwd(), file);
	});
};
