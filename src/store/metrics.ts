import { createSlice } from '@reduxjs/toolkit'
import { PayloadAction } from 'redux-starter-kit'
import { createSelector } from 'reselect'
import { ChartData, Metric, MetricRow, MetricUnits, MetricUpdate } from '../interfaces'
import { WeatherForLocation } from '../Features/Weather/reducer'
import moment from 'moment'

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
    metricDataUpdated: (metrics, action: PayloadAction<MetricUpdate>) => {
      const { name, value, id } = action.payload
      const i = metrics.data.findIndex(row => row.id === id)
      console.log(i)
      if (i >= 0) {
        metrics.data[i].chartData[name] = value
      } else {
        metrics.data.shift()
        const newRow = {
          id: id,
          at: moment(id).format('h:mm'),
          chartData: {
            [name]: value,
          },
        }
        metrics.data.push(newRow)
      }
    },
  },
})
export default slice.reducer
export const {
  metricToggled,
  metricKeysAdded,
  metricDataPopulated,
  metricUnitsAdded,
  metricDataUpdated,
} = slice.actions

export const getMetricData = createSelector(
  (state: Store) => state.metrics.data,
  data => data,
)
export const getMetricKeys = createSelector(
  (state: Store) => state.metrics.keys,
  keys => keys,
)
