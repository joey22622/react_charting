import * as React from 'react';
import { useEffect, useState } from 'react';
import { useQuery, useSubscription, gql } from '@apollo/client';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Metric, MetricRow, MetricVariable, MetricVariables, GqlMetricRow, MetricUnits, GqlMetricData, ChartData, MetricUpdate } from '../interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { getMetricData, metricDataPopulated, metricDataUpdated, metricUnitsAdded } from '../store/metrics';
import { getUniqueId } from './functions';
import moment from 'moment'

const thirtyMin: number = 1800000
const heartBeat = Date.now()

interface Props {
    metricObjs: Metric[],
}

const gqlSub = gql`subscription{
        newMeasurement{
            metric
            at
            value
            unit
        }
    }`

const buildGql = (metrics: string[]) => {
    let actionType = `getMeasurements`
    let paramType = `MeasurementQuery`
    let paramKey = `input`
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

const buildVariables = (metrics: string[]) => {
    let variables: MetricVariables = {}
    metrics.forEach(metric => {
        let variable: MetricVariable = {
            metricName: metric,
            before: heartBeat,
            after: heartBeat - thirtyMin
        }
        variables[metric] = variable
    });
    return variables
}

const buildLatestData = (data: GqlMetricRow): MetricUpdate => {
    return { name: data.metric, value: data.value, id: data.at }
}
const buildMetricUnits = (data: GqlMetricData): MetricUnits => {
    let units: MetricUnits = {}
    for (const metric in data) {
        units[metric] = data[metric][0].unit
    }
    return units
}

const Chart: React.FC<Props> = ({ metricObjs }) => {
    const dispatch = useDispatch()
    const [skip, setSkip] = useState<boolean>(false)

    const metrics: string[] = metricObjs.map(metric => metric.name)
    const metricData: MetricRow[] = useSelector(getMetricData)

    const sub = useSubscription(gqlSub, { skip: !skip })
    const res = useQuery(buildGql(metrics), { variables: { ...buildVariables(metrics), skip } })

    useEffect(() => {
        if (sub.data && sub.data.newMeasurement) {
            dispatch(metricDataUpdated(buildLatestData(sub.data.newMeasurement)))
        }
    }, [sub.data, sub.loading, dispatch])

    useEffect(() => {
        if (!res.loading && res.data) {
            dispatch(metricDataPopulated(buildMetricData(res.data)))
            dispatch(metricUnitsAdded(buildMetricUnits(res.data)))
            setSkip(true)
        }
    }, [res.data, res.loading, dispatch])

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