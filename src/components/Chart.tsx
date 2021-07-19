import * as React from 'react';
import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Provider, createClient, useQuery, useSubscription } from 'urql';
import { SettingsSystemDaydreamOutlined, Timer } from '@material-ui/icons';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

const client = createClient({
    url: 'https://react.eogresources.com/graphql',
});
const useStyles = makeStyles({
    chart: {
        height: '1000px',
        width: '1000px',
        backgroundColor: 'green'
    },
});

const query = `
query ($metricInfo: MeasurementQuery){
    heartBeat
    getMeasurements(input: $metricInfo){
        metric
        at
        value
        unit
    }
}
`


export default () => {
    return (
        <Provider value={client}>
            <Chart />
        </Provider>
    )
};

const Chart: React.FC = ({ children }) => {
    const classes = useStyles();
    const [range, setRange] = useState({
        before: 0,
        after: 0,
    })
    interface MetricRow {
        "oilTemp": number
        at: number
    }
    const [metricData, setMetricData] = useState<MetricRow[]>([
        { "oilTemp": 272.62, at: 1626682678202 },
        { "oilTemp": 279.94, at: 1626682679502 },
        { "oilTemp": 270.7, at: 1626682680804 },
    ])


    const formatMetricData = (data: { metric: string, at: number, value: number }[]): MetricRow[] => {
        let newData: MetricRow[] = []
        console.log('formatMetricData')
        console.log(data)

        data.forEach(row => {
            const value: number = row.value
            const at: number = row.at
            let dataRow: MetricRow = { 'oilTemp': value, at }
            newData.unshift(dataRow)
        })
        console.log(newData)
        return newData
    }
    const metricInfo = {
        metricName: "oilTemp",
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
        if (!fetching) {
            console.log('Range Updated', result.data)
            const range = {
                before: data.heartBeat,
                after: data.heartBeat - 1800000
            }
            setRange(range)
            setMetricData(formatMetricData(result.data.getMeasurements))
            console.log(range)
        }
    }
    useEffect(() => {
        // formatMetricData(range)
    }, [range])
    useEffect(() => {
        const timer = setInterval(() => {
            updateRange()
        }, 60000)
        return () => {
            clearInterval(timer)
        }
    })
    const stuff = [
        {
            "name": "Page G",
            "oilTemp": 3490,
            "pv": 4300,
            "amt": 2100
        }
    ]

    return (
        <div className={classes.chart}>
            <button onClick={() => updateRange()}>click me</button>
            <LineChart width={730} height={250} data={metricData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                <Line type="monotone" dataKey="oilTemp" stroke="#82ca9d" />
            </LineChart>

        </div>
    )
};

