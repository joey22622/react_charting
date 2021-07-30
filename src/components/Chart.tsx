import * as React from 'react';
import { useEffect } from 'react';
import { useQuery, useSubscription, gql } from '@apollo/client';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Metric, MetricRow, MetricVariable, MetricVariables, GqlMetricRow, GqlLastMetricRow, MetricUnits, GqlMetricData, ChartData, GqlSubRow, MetricUpdate } from '../interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { getMetricData, metricDataPopulated, metricDataUpdated, metricUnitsAdded } from '../store/metrics';
import { getUniqueId } from './functions';
import moment from 'moment'

const thirtyMin: number = 1800000

interface Props {
    metricObjs: Metric[],
    heartBeat: number
}
let loaded = false

const Chart: React.FC<Props> = ({ metricObjs, heartBeat, children }) => {
    const dispatch = useDispatch()
    const metrics: string[] = metricObjs.map(metric => metric.name)
    const metricData: MetricRow[] = useSelector(getMetricData)

    const gqlSub = gql`subscription{
        newMeasurement{
            metric
            at
            value
            unit
        }
    }`
    const sub = useSubscription(gqlSub)
    // @ts-ignore

    // CHECK FOR NEW METRIC NAME
    // DISPATCH NEW METRIC OBJ TO METRICS
    // DISPATCH KEY:VALUE, ID

    // REDUCER:
    // CHECK FOR EXISTING ID
    // IF YES: ASSIGN KEY:VALUE
    // IF NO: BUILD NEW OBJ, ASSIGN KEY:VALUE

    // DISPATCH LATEST VALUE



    if (sub.data && sub.data.newMeasurement) {
    }

    // GRAPHQL
    const buildGql = () => {
        let actionType = `getLastKnownMeasurement`
        let paramType = `String!`
        let paramKey = `metricName`

        if (!loaded) {
            actionType = `getMeasurements`
            paramType = `MeasurementQuery`
            paramKey = `input`
        }
        let queryHead = `query(`
        let queryContent = ``
        metrics.forEach((metric, i) => {
            queryHead += `$${metric}: ${paramType}, `
            queryContent += `
            ${metric}:${actionType}(${paramKey}: $${metric}){
                metric
                at
                value
                unit
            }`
        })
        queryHead += `){`
        return gql`${queryHead} ${queryContent}
        }`
    }

    const buildMetricData = (data: GqlMetricData): MetricRow[] => {
        const chartData: MetricRow[] = []
        const dataArr: GqlMetricRow[][] = []
        for (const col in data) {
            dataArr.push(data[col])
        }
        dataArr[0].forEach((col, i) => {
            const id = col.at
            const at: string = moment(id).format("h:mm")
            let metricValues: ChartData = {}
            dataArr.forEach((row, j) => {
                let value = dataArr[j][i].value
                let name = dataArr[j][i].metric
                metricValues[name] = value
            })


            let dataRow: MetricRow = { chartData: { ...metricValues }, at, id }
            chartData.push(dataRow)
        })
        return chartData
    }
    // const buildLatestData = (data: GqlLastMetricRow,): MetricRow => {
    //     let row: MetricRow = { id: 0, at: '', chartData: {} }
    //     for (const metric in data) {
    //         if (row.at.length <= 0) row.at = '' + moment(data[metric].at).format("h:mm")
    //         if (row.id === 0) row.id = data[metric].at
    //         row.chartData[metric] = data[metric].value
    //     }
    //     return row
    // }
    const buildLatestData = (data: GqlMetricRow): MetricUpdate => {
        // console.log(data)
        return { name: data.metric, value: data.value, id: data.at }
    }
    const buildMetricUnits = (data: GqlMetricData): MetricUnits => {
        let units: MetricUnits = {}
        for (const metric in data) {
            units[metric] = data[metric][0].unit
        }
        return units
    }

    const buildVariables = () => {
        let variables: MetricVariables = {}
        metrics.forEach(metric => {
            let variable: MetricVariable | string = metric
            if (!loaded) {
                variable = {
                    metricName: metric,
                    before: heartBeat,
                    after: heartBeat >= thirtyMin ? heartBeat - thirtyMin : 0
                }
            }
            variables[metric] = variable
        });
        return variables
    }

    buildVariables()
    const res = useQuery(buildGql(), { variables: { ...buildVariables() } })

    if (sub.data && sub.data.newMeasurement) {
        // console.log(buildLatestData(sub.data.newMeasurement))
        dispatch(metricDataUpdated(buildLatestData(sub.data.newMeasurement)))
    }


    useEffect(() => {
        res.refetch()
    }, [heartBeat])
    useEffect(() => {
        if (res.data) {
            if (!loaded) {
                loaded = true
                dispatch(metricDataPopulated(buildMetricData(res.data)))
                dispatch(metricUnitsAdded(buildMetricUnits(res.data)))
            } else {
                // dispatch(metricDataUpdtated(buildLatestData(res.data)))
            }

        }
    }, [res.data])

    return (
        <ResponsiveContainer>
            <LineChart data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey={'at'} tickCount={15}></XAxis>
                <YAxis allowDataOverflow={false} />
                <Tooltip />
                <Legend />
                {metricObjs.filter(metric => metric.active).map((metric, i) => (
                    <Line key={getUniqueId()} isAnimationActive={false} type="monotone" name={metric.name} dot={false} dataKey={`chartData[${metric.name}]`} unit={metric.unit} stroke={metric.color} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
};

export default Chart