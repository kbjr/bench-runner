
import { formatBytes } from './format-bytes';
import { cpus, platform, release, totalmem } from 'os';

export const nodeVersion = process.versions.node;
export const os = `${platform()} (${process.arch}) ${release()}`;
export const memory = formatBytes(totalmem());

export const cpuList: { [desc: string]: number } = { };

cpus().forEach((cpu) => {
	if (! cpuList[cpu.model]) {
		cpuList[cpu.model] = 1;
	}

	else {
		cpuList[cpu.model]++;
	}
});

export const cpuDesc = Object.keys(cpuList)
	.map((cpu) => `${cpuList[cpu]}x ${cpu}`)
	.join(' + ');

export const platformDesc = `${os}; Node ${nodeVersion}; ${cpuDesc}; ${memory} Memory`;
