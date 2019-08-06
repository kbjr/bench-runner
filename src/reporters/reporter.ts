
import { Benchmark } from '../benchmark';
import { SuiteResult } from '../suite';
import { ReporterConfig } from '../config';

export interface ReporterConstructor {
	new (benchmark: Benchmark, config: ReporterConfig) : Reporter;
}

export abstract class Reporter {
	constructor(
		protected readonly benchmark: Benchmark,
		protected readonly config: ReporterConfig
	) { }

	abstract write(result: SuiteResult) : void;
	abstract end() : Promise<void>;
}
