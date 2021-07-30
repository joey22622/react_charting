export interface Metric {
    id: string
    name: string
    active: boolean
    unit: string
    latestValue: number
    color: string
}
export interface ChartData {
    [index: string]: number
}
export interface MetricUpdate {
    name: string
    value: number
    id: number
}

export interface MetricRow {
    at: string
    id: number
    chartData: ChartData
}
export interface GqlMetricRow {
    __typename?: string
    metric: string,
    at: number,
    value: number
    unit: string
}
export interface GqlSubRow {
    __typename?: string
    metric: string,
    at: number,
    value: number
}
export interface GqlLastMetricRow {
    [index: string]: GqlMetricRow
}

export interface GqlMetricData {
    [index: string]: GqlMetricRow[]
}
export interface MetricVariable {
    metricName: string,
    before: number,
    after: Number
}
export interface MetricUnits {
    [index: string]: string
}
export interface MetricVariables {
    [index: string]: MetricVariable | string
}
