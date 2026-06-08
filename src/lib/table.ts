export type TableRow = {
	ovenTempC: number;
	ovenTempF: number;
	airTempC: number;
	airTempF: number;
	timeFactor: number; // recommendation multiplier
};

function cToF(c: number) {
	return (c * 9) / 5 + 32;
}

function roundTempC(c: number) {
	return Math.round(c);
}
function roundTempF(f: number) {
	return Math.round(f / 5) * 5;
}

export function generateConversionTable(minC = 120, maxC = 250, stepC = 5): TableRow[] {
	const rows: TableRow[] = [];
	const TIME_FACTOR = 0.8;

	for (let c = minC; c <= maxC; c += stepC) {
		const ovenTempC = roundTempC(c);
		const ovenTempF = roundTempF(cToF(ovenTempC));

		const airTempC = roundTempC(ovenTempC - 20); // default recommendation
		const airTempF = roundTempF(cToF(airTempC));

		rows.push({
			ovenTempC,
			ovenTempF,
			airTempC,
			airTempF,
			timeFactor: TIME_FACTOR,
		});
	}

	return rows;
}
