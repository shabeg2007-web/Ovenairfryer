import { convertOvenToAirFryer } from './conversion';

export type TempUnit = 'C' | 'F';
export type TimeMode = 'minutes' | 'hours_minutes';

export type PresetId =
  | 'chicken'
  | 'fries'
  | 'frozen'
  | 'vegetables'
  | 'fish'
  | 'beef'
  | 'pork'
  | 'pizza'
  | 'baked';

export type CalculatorState = {
  tempUnit: TempUnit;
  ovenTempC: number; // canonical oven temp in °C
  ovenTempF: number; // synchronized display oven temp in °F
  ovenTimeMinutes: number; // canonical oven time in minutes
  presetId: PresetId;
  // timeMode is used for URL + time input rendering. Calculations always use minutes.
  timeMode: TimeMode;
};

export type Preset = {
  id: PresetId;
  label: string;
  deltaTempC: number;
  deltaTimeFactor: number;
};

export const presets: readonly Preset[] = [
  { id: 'chicken', label: 'Chicken', deltaTempC: -5, deltaTimeFactor: 0.95 },
  { id: 'fries', label: 'Fries', deltaTempC: -3, deltaTimeFactor: 0.97 },
  { id: 'frozen', label: 'Frozen Foods', deltaTempC: -2, deltaTimeFactor: 0.98 },
  { id: 'vegetables', label: 'Vegetables', deltaTempC: -2, deltaTimeFactor: 1.0 },
  { id: 'fish', label: 'Fish', deltaTempC: -4, deltaTimeFactor: 0.93 },
  { id: 'beef', label: 'Beef', deltaTempC: -2, deltaTimeFactor: 0.95 },
  { id: 'pork', label: 'Pork', deltaTempC: -2, deltaTimeFactor: 0.96 },
  { id: 'pizza', label: 'Pizza', deltaTempC: -2, deltaTimeFactor: 0.99 },
  { id: 'baked', label: 'Baked Goods', deltaTempC: -6, deltaTimeFactor: 0.92 },
];

export function getPresetById(id: string | null | undefined): Preset {
  return (
    presets.find((p) => p.id === id) ?? presets.find((p) => p.id === 'chicken')
  ) as Preset;
}

function cToF(c: number) {
  return (c * 9) / 5 + 32;
}

function roundTempForDisplayC(c: number) {
  return Math.round(c);
}

function roundMinutes(min: number) {
  return Math.max(0, Math.round(min));
}

export function recalculate(state: {
  tempUnit: TempUnit;
  ovenTempC: number;
  ovenTimeMinutes: number;
  presetId: PresetId;
}) {
  const preset = getPresetById(state.presetId);

  const safeOvenTempC = Math.min(260, Math.max(40, state.ovenTempC));
  const safeOvenTimeMinutes = Math.min(720, Math.max(0, roundMinutes(state.ovenTimeMinutes)));

  // Base conversion using shared formulas
  const base = convertOvenToAirFryer({
    ovenTemp:
      state.tempUnit === 'C'
        ? safeOvenTempC
        : roundTempForDisplayC(safeOvenTempC),
    tempUnit: state.tempUnit,
    ovenTimeMinutes: safeOvenTimeMinutes,
  });

  const airTempC = roundTempForDisplayC(base.airTempC + preset.deltaTempC);
  const airTempF = roundTempForDisplayC((airTempC * 9) / 5 + 32);
  const airTimeMinutes = roundMinutes(base.airTimeMinutes * preset.deltaTimeFactor);

  const airTimeHuman = {
    hours: Math.floor(airTimeMinutes / 60),
    minutes: airTimeMinutes % 60,
  };

  const timeHuman =
    airTimeHuman.hours > 0
      ? `${airTimeHuman.hours} hr ${airTimeHuman.minutes} min`
      : `${airTimeHuman.minutes} min`;

  const explanation = `${preset.label}: ${
    preset.id === 'vegetables'
      ? 'standard temp drop with full time factor'
      : 'adjusted temp & time for better doneness'
  }.`;

  return {
    base,
    preset,
    result: {
      ovenTempC: base.ovenTempC,
      ovenTempF: base.ovenTempF,
      airTempC,
      airTempF,
      airTimeMinutes,
      timeFactor: preset.deltaTimeFactor * base.timeFactor,
      formula: {
        temp: `Air Fryer Temp ≈ Oven Temp − 20°C (or − 25°F), then ${preset.deltaTempC}°C preset adjustment`,
        time: `Air Fryer Time ≈ Oven Time × 0.8, then × ${preset.deltaTimeFactor} preset factor`,
      },
      explanation,
    },
  };
}

export function getOvenTempFromUnit(input: { tempUnit: TempUnit; ovenTempC: number }): {
  ovenTempC: number;
  ovenTempF: number;
} {
  const ovenTempC = input.ovenTempC;
  return { ovenTempC, ovenTempF: roundTempForDisplayC(cToF(ovenTempC)) };
}

