import * as React from 'react';
import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Metric, MetricRow, MetricVariable, MetricVariables, GqlMetricRow, GqlLastMetricRow, MetricUnits, GqlMetricData } from '../interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { getMetricData, metricDataPopulated, metricDataUpdtated, metricUnitsAdded } from '../store/metrics';
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
            // @ts-ignore
            dataArr.push(data[col])
        }
        dataArr[0].forEach((col, i) => {
            const id = col.at
            const at: string = moment(id).format("h:mm")
            let metricValues = {}
            dataArr.forEach((row, j) => {
                let value = dataArr[j][i].value
                let name = dataArr[j][i].metric
                // @ts-ignore
                metricValues[name] = value
            })


            let dataRow: MetricRow = { ...metricValues, at, id }
            chartData.push(dataRow)
        })
        return chartData
    }
    const buildLatestData = (data: GqlLastMetricRow,): MetricRow => {
        let row: MetricRow | { id: number, at: string } = { id: 0, at: '' }
        for (const metric in data) {
            // @ts-ignore
            if (row.at.length <= 0) row.at = '' + moment(data[metric].at).format("h:mm")
            // @ts-ignore
            if (row.id === 0) row.id = data[metric].at
            // @ts-ignore
            row[metric] = data[metric].value
        }
        return row
    }
    const buildMetricUnits = (data: GqlMetricData): MetricUnits => {
        let units: MetricUnits | {} = {}
        for (const metric in data) {
            // @ts-ignore
            units[metric] = data[metric][0].unit
        }
        return units
    }

    const input: MetricVariables | {} = {}
    const buildVariables = () => {
        metrics.forEach(metric => {
            let variable: MetricVariable | string = metric
            if (!loaded) {
                variable = {
                    metricName: metric,
                    before: heartBeat,
                    after: heartBeat >= thirtyMin ? heartBeat - thirtyMin : 0
                }
            }
            // @ts-ignore
            input[metric] = variable

        });
    }
    buildVariables()
    const res = useQuery(buildGql(), { variables: { ...input } })

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
                dispatch(metricDataUpdtated(buildLatestData(res.data)))
            }

        }
    }, [res.data])

    return (
        // <></>
        <ResponsiveContainer>
            <LineChart data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey={'at'} tickCount={15}></XAxis>
                <YAxis allowDataOverflow={false} />
                {/* ))} */}
                <Tooltip />
                <Legend />
                {metricObjs.filter(metric => metric.active).map((metric, i) => (
                    <Line key={getUniqueId()} isAnimationActive={false} type="monotone" dot={false} dataKey={metric.name} unit={metric.unit} stroke={metric.color} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
};

export default Chart