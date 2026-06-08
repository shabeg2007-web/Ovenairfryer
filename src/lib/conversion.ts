export type TempUnit = 'C' | 'F';
export type TimeMode = 'minutes' | 'hours_minutes';

export type ConversionInput = {
	ovenTemp: number;
	tempUnit: TempUnit;
	ovenTimeMinutes: number; // canonical internal representation
};

export type ConversionOutput = {
	ovenTempC: number;
	ovenTempF: number;
	airTempC: number;
	airTempF: number;
	ovenTimeMinutes: number;
	airTimeMinutes: number;

	// display/trace
	tempDeltaC: number;
	tempDeltaF: number;
	timeFactor: number;

	formula: {
		temp: string;
		time: string;
	};
};

function cToF(c: number) {
	return (c * 9) / 5 + 32;
}
function fToC(f: number) {
	return ((f - 32) * 5) / 9;
}

function roundTempC(c: number) {
	// default UX: round to nearest 1°C
	return Math.round(c);
}
function roundTempF(f: number) {
	// default UX: round to nearest 5°F
	return Math.round(f / 5) * 5;
}
function roundMinutes(min: number) {
	// default UX: round to nearest minute
	return Math.max(0, Math.round(min));
}

/**
 * Default recommendations:
 * - Reduce oven temperature by ~20°C (or 25°F)
 * - Reduce cooking time by ~20%
 */
const TEMP_REDUCTION_C = 20;
const TEMP_REDUCTION_F = 25;
const TIME_FACTOR = 0.8;

export function convertOvenToAirFryer(input: ConversionInput): ConversionOutput {
	const ovenTempC =
		input.tempUnit === 'C' ? input.ovenTemp : roundTempC(fToC(input.ovenTemp));
	const ovenTempF =
		input.tempUnit === 'F' ? input.ovenTemp : roundTempF(cToF(ovenTempC));

	const airTempC = roundTempC(ovenTempC - TEMP_REDUCTION_C);
	const airTempF = roundTempF(ovenTempF - TEMP_REDUCTION_F);

	const ovenTimeMinutes = roundMinutes(input.ovenTimeMinutes);
	const airTimeMinutes = roundMinutes(ovenTimeMinutes * TIME_FACTOR);

	const tempDeltaC = ovenTempC - airTempC;
	const tempDeltaF = ovenTempF - airTempF;

	return {
		ovenTempC,
		ovenTempF,
		airTempC,
		airTempF,
		ovenTimeMinutes,
		airTimeMinutes,
		tempDeltaC,
		tempDeltaF,
		timeFactor: TIME_FACTOR,
		formula: {
			temp: `Air Fryer Temp ≈ Oven Temp − ${TEMP_REDUCTION_C}°C (or − ${TEMP_REDUCTION_F}°F)`,
			time: `Air Fryer Time ≈ Oven Time × ${TIME_FACTOR} (≈ 20% less)`
		}
	};
}
