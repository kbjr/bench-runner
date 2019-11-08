
import * as yargs from 'yargs';
import { Argv, CommandModule, CommandBuilder, Arguments } from 'yargs';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
	Benchmark,
	Suite,
	CliReporter,
	JunitReporter,
	Config,
	ReporterConstructor,
	SuiteTests,
	BenchmarkOutcome,
	BeforeCallback,
	DefineSuiteCallback,
	TestCallback,
	DefineTestOptions
} from './index';

interface Options {
	config?: string;
	name?: string;
	files?: string[];
	warnThreshold?: number;
	failThreshold?: number;
	reporters?: string[];
	reportOut?: string;
	profile?: string;
	profileOut?: string;
	require?: string[];
	passExit: number;
	warnExit: number;
	failExit: number;
}

const builtInReporters = {
	cli: CliReporter,
	junit: JunitReporter
};

const builder: CommandBuilder<Options, Options> = (yargs: Argv<Options>) => {
	return yargs
		.options('config', {
			type: 'string',
			describe: 'Your benchmark config file'
		})
		.option('name', {
			type: 'string',
			describe: 'The name of your benchmark (usually shows up in the test output)'
		})
		.options('require', {
			type: 'string',
			array: true,
			describe: 'Any modules that should be required prior to running the benchmark'
		})
		.option('files', {
			type: 'string',
			array: true,
			describe: 'Your benchmark test files',
		})
		.option('warn-threshold', {
			type: 'number',
			describe: 'The delta threshold below which a benchmark will throw a warning',
		})
		.option('fail-threshold', {
			type: 'number',
			describe: 'The delta threshold below which a benchmark will fail',
		})
		.option('reporters', {
			type: 'string',
			array: true,
			describe: 'The list of reporters to use (these generate your test output)'
		})
		.option('profile', {
			type: 'string',
			describe: 'The file that contains your benchmark profile you want to test against'
		})
		.option('profile-out', {
			type: 'string',
			describe: 'If set, will additionally output a new benchmark profile to this file'
		})
		.options('pass-exit', {
			type: 'number',
			describe: 'The exit code to use when the benchmark passes',
			default: 0
		})
		.options('warn-exit', {
			type: 'number',
			describe: 'The exit code to use when the benchmark end with a warning',
			default: 0
		})
		.options('fail-exit', {
			type: 'number',
			describe: 'The exit code to use when the benchmark fails',
			default: 1
		});
};

const handler = async (args: Arguments<Options>) => {
	const config: Config = {
		name: null,
		files: null,
		warnThreshold: null,
		failThreshold: null,
		reporters: null,
		profile: null,
		profileOut: null
	};

	let configFile: any = { };

	if (args.config) {
		const file = resolve(process.cwd(), args.config);

		configFile = JSON.parse(readFileSync(file, 'utf8'));
	}

	config.name = args.name || configFile.name || 'Benchmark';
	config.files = args.files || configFile.files || [ ];
	config.warnThreshold = args.warnThreshold || configFile.warnThreshold || 0.8;
	config.failThreshold = args.failThreshold || configFile.failThreshold || 0.5;
	config.reporters = (args.reporters || configFile.reporters || [ 'cli' ]).map(getReporterFromConfig);
	config.profile = args.profile || configFile.profile || null;
	config.profileOut = args.profileOut || configFile.profileOut || null;

	const benchmark = new Benchmark(config);

	requireFiles(args.require);
	requireFiles(configFile.require);

	const module = require('./index');

	let currentSuite: Suite;

	// Bind the `suite` shortcut method into the library so test files can access it
	module.suite = (name: string, tests: SuiteTests | DefineSuiteCallback) => {
		if (typeof tests === 'function') {
			currentSuite = benchmark.add(name, { });

			tests();

			currentSuite = null;
		}

		else {
			benchmark.add(name, tests as SuiteTests);
		}
	};

	module.suite.test = <D>(name: string, test: TestCallback<void> | DefineTestOptions<D>) => {
		if (! currentSuite) {
			throw new Error('suite.test can only be called from inside a suite definition');
		}

		if (typeof test === 'function') {
			currentSuite.add(name, test);
		}

		else {
			currentSuite.add(name, test.test, {
				before: test.before,
				generateData: test.generateData,
				generateDataArray: test.generateDataArray
			});
		}
	};

	module.suite.before = (callback: BeforeCallback) => {
		if (! currentSuite) {
			throw new Error('suite.before can only be called from inside a suite definition');
		}

		currentSuite.before(callback);
	};

	await benchmark.run();

	switch (benchmark.outcome) {
		case BenchmarkOutcome.Fail:
			process.exit(args.failExit);
			break;

		case BenchmarkOutcome.Warn:
			process.exit(args.warnExit);
			break;

		case BenchmarkOutcome.Pass:
		case BenchmarkOutcome.None:
			process.exit(args.passExit);
			break;
	}
};

const getReporterFromConfig = (reporter: string | [ string, object ]) : [ ReporterConstructor, object ] => {
	if (typeof reporter === 'string') {
		if (builtInReporters[reporter]) {
			return [ builtInReporters[reporter], { } ];
		}

		try {
			const Reporter = require(reporter as string);

			return [ Reporter, { } ];
		}

		catch (error) {
			throw new Error(`Failed to find reporter "${reporter}"`);
		}
	}

	else if (Array.isArray(reporter)) {
		const resolved = getReporterFromConfig(reporter[0]);

		return [ resolved[0], reporter[1] ];
	}

	throw new Error('Invalid value for reporter in config');
};

const requireFiles = (files: string[]) => {
	if (Array.isArray(files)) {
		files.forEach((file) => {
			// For relative file paths, we resolve them relative to cwd
			if (file.indexOf('./') === 0 || file.indexOf('../') === 0) {
				require(resolve(process.cwd(), file));
			}

			else {
				require(file);
			}
		});
	}
};

yargs
	.scriptName('bench')
	.command('run [options]', 'Runs your benchmark suite', { handler, builder })
	.help()
	.completion('completion')
	.wrap(Math.min(yargs.terminalWidth(), 120))
	.argv;
