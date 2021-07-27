// import { reducer as weatherReducer } from '../Features/Weather/reducer'

// export default {
//   weather: weatherReducer,
// }

import { combineReducers } from 'redux'
import { reducer as weatherReducer } from '../Features/Weather/reducer'
import metricsReducer from './metrics'

export default combineReducers({
  weather: weatherReducer,
  metrics: metricsReducer,
})
