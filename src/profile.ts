
import { readFileSync, writeFileSync } from 'fs';
import { nodeVersion, os, memory, cpuDesc } from './platform';
import { SuiteResult } from './suite';

export interface ProfileData {
	os: string;
	node: string;
	cpu: string;
	mem: string;
	updated: string;
	suites: {
		[name: string]: ProfileSuite;
	};
}

export interface ProfileSuite {
	name: string;
	updated: string;
	tests: {
		[name: string]: number;
	}
}

export class Profile {
	static readFromFile(file: string) : Profile {
		const contents = readFileSync(file, 'utf8');
		const profileData: ProfileData = JSON.parse(contents);

		return new Profile(profileData);
	}

	static create() {
		return new Profile({
			os,
			node: nodeVersion,
			cpu: cpuDesc,
			mem: memory,
			updated: (new Date).toISOString(),
			suites: { }
		});
	}

	public readonly updated: string;
	public readonly os: string;
	public readonly node: string;
	public readonly cpu: string;
	public readonly mem: string;
	public readonly suites: {
		[name: string]: ProfileSuite;
	}

	constructor(data: ProfileData) {
		this.updated = data.updated;
		this.os = data.os;
		this.node = data.node;
		this.cpu = data.cpu;
		this.mem = data.mem;
		this.suites = data.suites;
	}

	updateSuite(newResults: SuiteResult) {
		const suite = this.suites[newResults.name] = {
			name: newResults.name,
			updated: (new Date).toISOString(),
			tests: { }
		};

		newResults.tests.forEach((test) => {
			suite.tests[test.name] = test.hz.raw;
		});
	}

	getJSON() {
		const data: ProfileData = {
			updated: this.updated,
			os: this.os,
			node: this.node,
			cpu: this.cpu,
			mem: this.mem,
			suites: this.suites
		};

		return JSON.stringify(data, null, '  ');
	}

	writeToFile(file: string) {
		const contents = this.getJSON();

		writeFileSync(file, contents, 'utf8');
	}
}
