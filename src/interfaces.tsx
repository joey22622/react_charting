export interface Metric {
    id: string
    name: string
    active: boolean
    unit: string
    latestValue: number
    color: string
}
export interface MetricRow {
    "oilTemp"?: number
    "tubingPressure"?: number
    "waterTemp"?: number
    "casingPressure"?: number
    "injValveOpen"?: number
    "flareTemp"?: number
    at: string
    id: number
}
export interface GqlMetricRow {
    __typename?: string
    metric: string,
    at: number,
    value: number
    unit: string
}
export interface GqlLastMetricRow {
    "oilTemp"?: GqlMetricRow
    "tubingPressure"?: GqlMetricRow
    "waterTemp"?: GqlMetricRow
    "casingPressure"?: GqlMetricRow
    "injValveOpen"?: GqlMetricRow
    "flareTemp"?: GqlMetricRow
}
export interface GqlMetricData {
    "oilTemp"?: GqlMetricRow[]
    "tubingPressure"?: GqlMetricRow[]
    "waterTemp"?: GqlMetricRow[]
    "casingPressure"?: GqlMetricRow[]
    "injValveOpen"?: GqlMetricRow[]
    "flareTemp"?: GqlMetricRow[]
}
export interface MetricVariable {
    metricName: string,
    before: number,
    after: Number
}
export interface MetricUnits {
    "oilTemp"?: string
    "tubingPressure"?: string
    "waterTemp"?: string
    "casingPressure"?: string
    "injValveOpen"?: string
    "flareTemp"?: string
}
export interface MetricVariables {
    "oilTemp"?: MetricVariable | string
    "tubingPressure"?: MetricVariable | string
    "waterTemp"?: MetricVariable | string
    "casingPressure"?: MetricVariable | string
    "injValveOpen"?: MetricVariable | string
    "flareTemp"?: MetricVariable | string
}
