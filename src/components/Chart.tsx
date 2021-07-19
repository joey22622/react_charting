import * as React from 'react';
import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Provider, createClient, useQuery, useSubscription } from 'urql';
import { SettingsSystemDaydreamOutlined, Timer } from '@material-ui/icons';

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
            console.log(range)
        }
    }

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
        </div>
    )
};
