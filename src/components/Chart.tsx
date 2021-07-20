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
    getMeasurements(input: $metricInfo){
        metric
        at
        value
    }
}`
const thirtyMin: number = 1800000

interface Props {
    metrics: Metric[],
    heartBeat: number
}

const Chart: React.FC<Props> = ({ metrics, heartBeat, children }) => {
    const classes = useStyles();

    const [range, setRange] = useState({
        before: 0,
        after: 0,
    })
    useEffect(() => {
        console.log('alsdfjalsdkf')
        console.log(heartBeat)
        reexecuteQuery({ requestPolicy: 'network-only' })
        if (data) updateRange()
    }, [heartBeat])
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
            if (counter === 0) {
                const value: number = row.value
                const at: number = row.at
                let dataRow: MetricRow = { 'oilTemp': value, at }
                newData.unshift(dataRow)
                // counter = 0
            }
            // counter++
        })
        return newData
    }

    const updateRange = () => {
        const range = {
            before: data.heartBeat,
            after: data.heartBeat
        }
        setRange(range)
        setMetricData(formatMetricData(result.data.getMeasurements))
    }

    // GRAPHQL
    const metricInfo = {
        metricName: "oilTemp",
        before: heartBeat,
        after: heartBeat >= thirtyMin ? heartBeat - thirtyMin : 0
    }

    const [result, reexecuteQuery] = useQuery({
        query,
        variables: {
            metricInfo
        }
    });
    const { fetching, data, error } = result;
    const reRunQuery = () => {
        console.log(`re-running query`);
        reexecuteQuery({ requestPolicy: 'network-only' })
        if (data) console.log(`data returned`);

    }

    return (
        <div className={classes.chart}>
            <button onClick={() => updateRange()}>click me</button>
            <LineChart width={1000} height={600} data={metricData}
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