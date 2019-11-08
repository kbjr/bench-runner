
import { resolve } from 'path';
import { createWriteStream, WriteStream } from 'fs';
import { Benchmark } from '../benchmark';
import { SuiteResult } from '../suite';
import { ReporterConfig } from '../config';

export interface ReporterConstructor {
	new (benchmark: Benchmark, config: ReporterConfig) : Reporter;
}

export abstract class Reporter {
	protected outStream: WriteStream | NodeJS.WriteStream;

	constructor(
		protected readonly benchmark: Benchmark,
		protected readonly config: ReporterConfig
	) {
		this.outStream = (config.out && config.out !== '-')
			? createWriteStream(resolve(process.cwd(), config.out))
			: process.stdout;
	}

	abstract write(result: SuiteResult) : void;
	abstract end() : Promise<void>;

	protected _write(chunk: string) : Promise<void> {
		return new Promise((resolve, reject) => {
			this.outStream.write(chunk, (error) => {
				if (error) {
					return reject(error);
				}

				resolve();
			});
		});
	}

	protected _end() : Promise<void> {
		return new Promise((resolve) => {
			if (this.outStream === process.stdout) {
				return this._write('\n');
			}

			else {
				this.outStream.end(() => resolve());
			}
		});
	}
}
