import { createSlice, createAction } from '@reduxjs/toolkit'
import { PayloadAction } from 'redux-starter-kit'
import { createSelector } from 'reselect'
// import { apiCallBegan } from './api'
import { Metric, MetricRow, MetricUnits } from '../interfaces'
import { WeatherForLocation } from '../Features/Weather/reducer'
import { State } from 'react-use/lib/useScroll'

interface Store {
  weather: WeatherForLocation
  metrics: MetricsInitState
}

interface MetricsInitState {
  keys: Metric[] | []
  data: MetricRow[] | []
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
      //   @ts-ignore
      const i = metrics.keys.findIndex(metric => metric.id === action.payload)
      //   @ts-ignore
      metrics.keys[i].active = !metrics.keys[i].active
    },
    metricKeysAdded: (metrics, action: PayloadAction<Metric[]>) => {
      metrics.keys = action.payload
    },
    metricUnitsAdded: (metrics, action: PayloadAction<MetricUnits>) => {
      metrics.keys.forEach(metric => {
        console.log(action.payload)
        // @ts-ignore
        metric.unit = action.payload[metric.name]
      })
    },
    metricDataPopulated: (metrics, action: PayloadAction<MetricRow[]>) => {
      //  writes the inital state of the metrics slice
      metrics.data = action.payload
    },
    metricDataUpdtated: (metrics, action: PayloadAction<MetricRow>) => {
      //  removes the oldest row of all metrics and adds the latest row
      //  adds latestValue field metric keys
      metrics.data.shift()
      metrics.keys.forEach(metric => {
        // @ts-ignore
        metric.latestValue = action.payload[metric.name]
      })
      //   @ts-ignore
      metrics.data.push(action.payload)
      // console.log(action.payload)
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
