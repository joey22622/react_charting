import { createSlice, createAction } from '@reduxjs/toolkit'
import { createSelector } from 'reselect'
// import { apiCallBegan } from './api'
import moment from 'moment'

const slice = createSlice({
  name: 'metrics',
  initialState: {
    list: [],
  },
  reducers: {
    metricToggled: (metrics, action) => {
      //   @ts-ignore
      const i = metrics.list.findIndex(metric => metric.id === action.payload.id)
      //   @ts-ignore
      metrics.list[i].id.active = !metrics.list[i].id.active
    },
    metricDataPopulated: (metrics, action) => {
      //  writes the inital state of the metrics slice
      metrics.list = action.payload
      console.log(metrics)
    },
    metricDataUpdtated: (metrics, action) => {
      //  removes the oldest row of all metrics and adds the latest row
    },
  },
})
export default slice.reducer
export const { metricToggled, metricDataPopulated, metricDataUpdtated } = slice.actions
