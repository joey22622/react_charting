import * as React from 'react';
import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery, gql, QueryResult } from '@apollo/client';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, Label, ResponsiveContainer } from 'recharts';
import { Metric, MetricRow, MetricVariable, MetricVariables, GqlMetricRow } from '../interfaces'
import { configureStore } from 'redux-starter-kit';

const useStyles = makeStyles({
    chart: {
        height: '600px',
        width: '1000px',
    },
});

const thirtyMin: number = 1800000

interface Props {
    metricObjs: Metric[],
    heartBeat: number
}

const Chart: React.FC<Props> = ({ metricObjs, heartBeat, children }) => {
    const metrics: string[] = metricObjs.map(metric => metric.name)
    const classes = useStyles();
    let query = gql`query{heartBeat}`

    const [metricData, setMetricData] = useState<MetricRow[] | []>([])

    useEffect(() => {
    }, [heartBeat])


    // GRAPHQL
    const buildGql = () => {
        if (metrics.length) {
            let queryHead = `query(`
            let queryContent = ``
            metrics.forEach((metric, i) => {
                queryHead += `$${metric}: MeasurementQuery, `
                queryContent += `
            ${metric}:getMeasurements(input: $${metric}){
                metric
                at
                value
            }`
            })
            queryHead += `){`
            query = gql`${queryHead} ${queryContent}
        }`
        } else {
            query = gql`query{heartBeat}`
        }
    }

    // @ts-ignore
    const buildMetricData = (data: GqlMetricData): MetricRow[] => {
        const chartData: MetricRow[] = []
        const dataArr: GqlMetricRow[][] = []
        for (const col in data) {
            dataArr.push(data[col])
        }
        dataArr[0].forEach((col, i) => {
            const value: number = col.value
            const at: number = col.at
            let metricValues = {}
            dataArr.forEach((row, j) => {
                let value = dataArr[j][i].value
                let name = dataArr[j][i].metric
                // @ts-ignore
                metricValues[name] = value
            })


            // @ts-ignore
            let dataRow: MetricRow = { ...metricValues, at }
            // @ts-ignore
            chartData.unshift(dataRow)
        })
        setMetricData(chartData)
    }
    const input: MetricVariables | {} = {}
    const buildVariables = () => {
        let arr = []
        metrics.forEach(metric => {
            let variable: MetricVariable = {
                metricName: metric,
                before: heartBeat,
                after: heartBeat >= thirtyMin ? heartBeat - thirtyMin : 0
            }
            // Why????
            // @ts-ignore
            input[metric] = variable
        });
    }
    buildGql()
    buildVariables()
    const res = useQuery(query, { variables: { ...input } })
    useEffect(() => {
        if (res.data && !res.data.heartBeat) {
            buildMetricData(res.data)
        }
    }, [res.data])
    return (
        <ResponsiveContainer>
            <LineChart data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey={'at'} unit='minutes'><Label></Label></XAxis>
                {metrics.map(metric => (
                    <YAxis dataKey={metric} />
                ))}
                <Tooltip />
                <Legend />
                {metrics.map((metric, i) => (
                    <Line key={i} type="monotone" dot={false} dataKey={metric} stroke="#82ca9d" />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
};

export default Chart