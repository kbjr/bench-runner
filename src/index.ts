
import { SuiteTests } from './benchmark';
import { nodeVersion, os, cpuList, cpuDesc, platformDesc } from './platform';
import { CliReporter } from './reporters/cli';
// import { HtmlReporter } from './reporters/html';
// import { TextReporter } from './reporters/text';
import { BeforeCallback, BeforeTestCallback, GenerateTestDataCallback, TestCallback, GenerateTestDataArrayCallback } from './suite';

export { Benchmark, SuiteTests } from './benchmark';
export { Config, ReporterConfig } from './config';
export { ProfileData, ProfileSuite, Profile } from './profile';
export { BenchmarkOutcome, TestResult, SuiteResult, Stat, SuiteConfig, Suite, BeforeCallback, TestCallback, BeforeTestCallback, TestOptions } from './suite';

// Reporters
export { Reporter, ReporterConstructor } from './reporters/reporter';
export { CliReporter } from './reporters/cli';
// export { HtmlReporter } from './reporters/html';
// export { TextReporter } from './reporters/text';

export const reporters = {
	cli: CliReporter,
	// html: HtmlReporter,
	// text: TextReporter
};

// Platform Details
export const platform = {
	nodeVersion,
	os,
	cpuList,
	cpuDesc,
	description: platformDesc
};

// These are set by the CLI if it is running

export interface DefineSuiteCallback {
	// 
}

export interface DefineTestOptions<D> {
	before?: BeforeTestCallback;
	generateData?: GenerateTestDataCallback<D>;
	generateDataArray?: GenerateTestDataArrayCallback<D>;
	test: TestCallback<D>;
}

export interface DefineSuite {
	/**
	 * Define a new suite of tests for the benchmark to run (only available when
	 * running tests through the CLI).
	 *
	 * @param name The name of the suite
	 * @param tests The tests to be run
	 */
	(name: string, tests: SuiteTests | DefineSuiteCallback): void;

	/**
	 * Adds a new before handler to the suite currently being defined
	 */
	before(callback: BeforeCallback): void;

	/**
	 * Adds a new test to the suite currently being defined
	 */
	test(name: string, test: TestCallback<void> | DefineTestOptions<any>): void;
}

export let suite: DefineSuite;
