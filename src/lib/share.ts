export function parseNumberOrNull(value: string | null | undefined) {
	if (!value) return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

export function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}

/**
 * Build canonical share URL query params.
 * - oven/tempUnit: oven temp and unit (C/F)
 * - time: minutes canonical internal representation
 */
export function buildShareQuery(params: {
	ovenTemp: number;
	tempUnit: 'C' | 'F';
	ovenTimeMinutes: number;
	timeMode: 'minutes' | 'hours_minutes';
	ovenHours?: number;
	ovenMinutes?: number;
}) {
	const urlParams = new URLSearchParams();

	urlParams.set('oven', String(params.ovenTemp));
	urlParams.set('tempUnit', params.tempUnit);
	urlParams.set('time', String(params.ovenTimeMinutes));
	urlParams.set('timeMode', params.timeMode);

	if (params.timeMode === 'hours_minutes') {
		urlParams.set('hours', String(params.ovenHours ?? 0));
		urlParams.set('minutes', String(params.ovenMinutes ?? 0));
	}

	return urlParams.toString();
}
