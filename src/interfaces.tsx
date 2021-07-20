export interface Metric {
    name: string,
    active: boolean
}
export interface MetricRow {
    "oilTemp"?: number
    "tubingPressure"?: number
    "waterTemp"?: number
    "casingPressure"?: number
    "injValveOpen"?: number
    "flareTemp"?: number
    at: number
}