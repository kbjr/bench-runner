
import { ReporterConstructor } from './reporters/reporter';

export interface Config {
	name: string;
	files: string | string[];
	warnThreshold: number;
	failThreshold: number;
	reporters: Array<ReporterConstructor | ReporterWithConfig>;
	profile?: string;
	profileOut?: string;
}

export type ReporterWithConfig = [ ReporterConstructor, ReporterConfig ];

export interface ReporterConfig {
	out?: string;
}
