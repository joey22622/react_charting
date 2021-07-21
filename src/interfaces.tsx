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
export interface MetricVariable {
    metricName: string,
    before: number,
    after: Number
}
export interface MetricVariables {
    "oilTemp"?: MetricVariable
    "tubingPressure"?: MetricVariable
    "waterTemp"?: MetricVariable
    "casingPressure"?: MetricVariable
    "injValveOpen"?: MetricVariable
    "flareTemp"?: MetricVariable
}

export interface MetricD {

}