import * as React from 'react';
import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'urql';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { Metric, MetricRow } from '../interfaces'

const useStyles = makeStyles({
    chart: {
        height: '1000px',
        width: '1000px',
    },
});
const queryContent = `
    getMeasurements(input: $metricInfo){
        metric
        at
        value
    }`
const query = `
query ($metricInfo: MeasurementQuery){
    heartBeat
    ${queryContent}
}`

interface Props {
    metrics: Metric[],
}

const Chart: React.FC<Props> = ({ metrics, children }) => {
    const classes = useStyles();
    const [range, setRange] = useState({
        before: 0,
        after: 0,
    })

    // console.log(metrics)
    const [metricData, setMetricData] = useState<MetricRow[]>([
        { oilTemp: 272.62, at: 1626682678202 },
        { oilTemp: 279.94, at: 1626682679502 },
        { oilTemp: 270.7, at: 1626682680804 },
    ])


    const formatMetricData = (data: { metric: string, at: number, value: number }[]): MetricRow[] => {
        let newData: MetricRow[] = []
        let counter: number = 0;
        data.forEach(row => {
            if (counter === 10) {
                const value: number = row.value
                const at: number = row.at
                let dataRow: MetricRow = { 'oilTemp': value, at }
                newData.unshift(dataRow)
                counter = 0
            }
            counter++
        })
        return newData
    }
    const metricInfo = {
        metricName: metrics[0] || "oilTemp",
        before: range.before,
        after: range.after
    }
    const [result, reexecuteQuery] = useQuery({
        query,
        variables: {
            metricInfo
        }
    });
    const { fetching, data, error } = result;
    const updateRange = () => {
        reexecuteQuery({ requestPolicy: 'network-only' })
        console.log('asdfasdfasdf')
        if (data) {
            const range = {
                before: data.heartBeat,
                after: data.heartBeat - 1800000
            }
            setRange(range)
            setMetricData(formatMetricData(result.data.getMeasurements))
        }
    }
    useEffect(() => {
        console.log(result)
        if (data) {
            console.log('initialRender')
            updateRange()
        }
    }, [])
    useEffect(() => {
        const timer = setInterval(() => {
            updateRange()
        }, 60000)
        return () => {
            clearInterval(timer)
        }
    })

    return (
        <div className={classes.chart}>
            <button onClick={() => updateRange()}>click me</button>
            <LineChart width={1000} height={600} data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="oilTemp" stroke="#82ca9d" />
            </LineChart>
        </div>
    )
};

export default Chart