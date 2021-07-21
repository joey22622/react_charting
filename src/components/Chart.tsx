import * as React from 'react';
import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'urql';
import { useQuery as apUseQuery, gql, QueryResult } from '@apollo/client';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { Metric, MetricRow, MetricVariable, MetricVariables } from '../interfaces'
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
    let query = gql`query{
        heartBeat
    }`


    const [metricD, setMetricD] = useState<MetricRow[][] | []>([])

    useEffect(() => {
    }, [heartBeat])
    // console.log(metrics)
    const [metricData, setMetricData] = useState<MetricRow[]>([
        { oilTemp: 272.62, at: 1626682678202 },
        { oilTemp: 279.94, at: 1626682679502 },
        { oilTemp: 270.7, at: 1626682680804 },
    ])


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
            let newquery = `${queryHead} ${queryContent}
        }`
            query = gql`${queryHead} ${queryContent}
        }`
            console.log(newquery)
        } else {
            query = gql`query{
                heartBeat
            }`
        }
    }
    // const formatMetricData = (data: { metric: string, at: number, value: number }[]): MetricRow[] => {
    //     let newData: MetricRow[] = []
    //     let counter: number = 0;
    //     data.forEach(row => {
    //         if (counter === 0) {
    //             const value: number = row.value
    //             const at: number = row.at
    //             let dataRow: MetricRow = { 'oilTemp': value, at }
    //             newData.unshift(dataRow)
    //             // counter = 0
    //         }
    //         // counter++
    //     })
    //     return newData
    // }

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
    const res = apUseQuery(query, { variables: { ...input } })
    console.log(res)
    return (
        <div className={classes.chart}>
            <button>click me</button>
            <LineChart width={1000} height={300} data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dot={false} dataKey="oilTemp" stroke="#82ca9d" />
            </LineChart>
        </div>
    )
};

export default Chart