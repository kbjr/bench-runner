
enum Bytes {
	B = 1,
	KB = 2 ** 10,
	MB = 2 ** 20,
	GB = 2 ** 30,
	TB = 2 ** 40,
	PB = 2 ** 50
}

export const formatBytes = (bytes: number) : string => {
	let qty: number;
	let unit: string;

	if (bytes < Bytes.KB) {
		qty = bytes;
		unit = 'B';
	}

	else if (bytes < Bytes.MB) {
		qty = bytes / Bytes.KB;
		unit = 'KB';
	}

	else if (bytes < Bytes.GB) {
		qty = bytes / Bytes.MB;
		unit = 'MB';
	}

	else if (bytes < Bytes.TB) {
		qty = bytes / Bytes.GB;
		unit = 'GB';
	}

	else if (bytes < Bytes.PB) {
		qty = bytes / Bytes.GB;
		unit = 'GB';
	}

	else {
		qty = bytes / Bytes.PB;
		unit = 'PB';
	}

	return `${((qty * 1000) | 0) / 1000}${unit}`;
};
