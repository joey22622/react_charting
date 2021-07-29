import { createSlice } from '@reduxjs/toolkit'
import { PayloadAction } from 'redux-starter-kit'
import { createSelector } from 'reselect'
import { Metric, MetricRow, MetricUnits } from '../interfaces'
import { WeatherForLocation } from '../Features/Weather/reducer'

interface Store {
  weather: WeatherForLocation
  metrics: MetricsInitState
}

interface MetricsInitState {
  keys: Metric[]
  data: MetricRow[]
}
const initialState: MetricsInitState = {
  keys: [],
  data: [],
}
const slice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    metricToggled: (metrics, action) => {
      const i = metrics.keys.findIndex(metric => metric.id === action.payload)
      metrics.keys[i].active = !metrics.keys[i].active
    },
    metricKeysAdded: (metrics, action: PayloadAction<Metric[]>) => {
      metrics.keys = action.payload
    },
    metricUnitsAdded: (metrics, action: PayloadAction<MetricUnits>) => {
      metrics.keys.forEach(metric => {
        metric.unit = action.payload[metric.name]
      })
    },
    metricDataPopulated: (metrics, action: PayloadAction<MetricRow[]>) => {
      metrics.data = action.payload
    },
    metricDataUpdtated: (metrics, action: PayloadAction<MetricRow>) => {
      metrics.data.shift()
      metrics.keys.forEach(metric => {
        metric.latestValue = action.payload.chartData[metric.name]
      })
      metrics.data.push(action.payload)
    },
  },
})
export default slice.reducer
export const {
  metricToggled,
  metricKeysAdded,
  metricDataPopulated,
  metricUnitsAdded,
  metricDataUpdtated,
} = slice.actions

export const getMetricData = createSelector(
  (state: Store) => state.metrics.data,
  data => data,
)
export const getMetricKeys = createSelector(
  (state: Store) => state.metrics.keys,
  keys => keys,
)
