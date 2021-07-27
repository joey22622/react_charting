import * as React from 'react';
import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Metric, MetricRow, MetricVariable, MetricVariables, GqlMetricRow, GqlLastMetricRow } from '../interfaces'

const thirtyMin: number = 1800000

interface Props {
    metricObjs: Metric[],
    heartBeat: number
}
let init = true

const Chart: React.FC<Props> = ({ metricObjs, heartBeat, children }) => {
    const metrics: string[] = metricObjs.map(metric => metric.name)
    let query = gql`query{heartBeat}`

    const [metricData, setMetricData] = useState<MetricRow[] | []>([])

    // GRAPHQL
    const buildGql = () => {
        let actionType = `getLastKnownMeasurement`
        let paramType = `String!`
        let paramKey = `metricName`
        let actionId = 'Update'
        if (init) {
            actionType = `getMeasurements`
            paramType = `MeasurementQuery`
            paramKey = `input`
            actionId = 'Init'
        }
        let queryHead = `query(`
        let queryContent = ``
        metrics.forEach((metric, i) => {
            queryHead += `$${metric}: ${paramType}, `
            queryContent += `
            ${metric + actionId}:${actionType}(${paramKey}: $${metric}){
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
    // console.log(buildGql());
    // @ts-ignore
    const buildMetricData = (data: GqlMetricData): MetricRow[] => {
        const chartData: MetricRow[] = []
        const dataArr: GqlMetricRow[][] = []
        for (const col in data) {
            dataArr.push(data[col])
        }
        dataArr[0].forEach((col, i) => {
            const id = col.at
            const time = (i + 1) / (dataArr[0].length) * 30
            const minute = Math.round(time)
            const seconds: number = minute % 1 * 60
            const at: string = minute + ':' + seconds
            let metricValues = {}
            dataArr.forEach((row, j) => {
                let value = dataArr[j][i].value
                let name = dataArr[j][i].metric
                // @ts-ignore
                metricValues[name] = value
            })


            // @ts-ignore
            let dataRow: MetricRow = { ...metricValues, at, id }
            // @ts-ignore
            chartData.push(dataRow)
        })
        setMetricData(chartData)
    }
    // @ts-ignore
    const updateMetricData = (storeData: MetricData[], data: GqlLastMetricRow,): MetricRow => {
        let newStoreData = [...storeData]
        let row: MetricRow | { id: number, at: string } = { id: 0, at: '' }
        for (const metric in data) {
            // console.log(metric)
            // @ts-ignore
            if (row.at.length <= 0) row.at = '' + data[metric].at
            // @ts-ignore
            if (row.id === 0) row.id = data[metric].at
            // @ts-ignore
            row[metric] = data[metric].value
        }
        newStoreData.shift()
        newStoreData.push(row)
        setMetricData(newStoreData)

    }
    const input: MetricVariables | {} = {}
    const buildVariables = () => {
        metrics.forEach(metric => {
            let variable: MetricVariable | string = metric
            if (init) {
                variable = {
                    metricName: metric,
                    before: heartBeat,
                    after: heartBeat >= thirtyMin ? heartBeat - thirtyMin : 0
                }
            }
            // Why????
            // @ts-ignore
            input[metric] = variable

        });
    }
    buildVariables()
    // console.log(init)
    // console.log(input)
    // console.log(buildGql());
    const res = useQuery(buildGql(), { variables: { ...input } })
    useEffect(() => {
        console.log(res.data)
        if (res.data) {
            if (init) {
                init = false
                buildMetricData(res.data)
            } else {
                console.log(res.data)
                updateMetricData(metricData, res.data)
            }

        }
    }, [res.data])
    // useEffect(() => {
    //     console.log(metricData.length)
    //     if (metricData.length > 0) {
    //         console.log('oldest', metricData[0].id)
    //         console.log('newest', metricData[metricData.length - 1].at)
    //     }
    // }, [metricData])
    return (
        // <></>
        <ResponsiveContainer>
            <LineChart data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey={'at'} tickCount={15}></XAxis>
                {metricObjs.filter(metric => metric.active).map((metric, i) => (
                    <YAxis key={i} dataKey={metric.name} />
                ))}
                <Tooltip />
                <Legend />
                {metricObjs.filter(metric => metric.active).map((metric, i) => (
                    <Line key={i} type="monotone" dot={false} dataKey={metric.name} stroke="#82ca9d" />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
};

export default Chart