import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Provider, createClient, useQuery, useSubscription } from 'urql';
import { SettingsSystemDaydreamOutlined, Timer } from '@material-ui/icons';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import Chart from './Chart'
import { Metric } from '../interfaces'


const client = createClient({
    url: 'https://react.eogresources.com/graphql',
});
const useStyles = makeStyles({
    filterRow: {
        height: '100px',
        width: '1000px',
        background: 'rgba(0,0,0,.6)'
    },
});

const query = `
query{
    getMetrics
}
`


export default () => {
    return (
        <Provider value={client}>
            <FilterRow />
        </Provider>
    )
};
const FilterRow: React.FC = ({ children }) => {
    const classes = useStyles();
    const [metrics, setMetrics] = useState<Metric[]>([])
    const handleMetrics = (data: string[]): Metric[] => {
        let result: Metric[] = []
        data.map(name => {
            let metric: Metric = {
                name,
                active: false
            }
            result.unshift(metric)
        })
        return result
    }
    const toggleMetric = (i: number) => {
        let newState = [...metrics]
        newState[i].active = true
        console.log(newState[i].active)
        setMetrics(newState)
    }
    const hi = () => {
        console.log('HI')
    }
    const [result] = useQuery({ query })
    const { fetching, data, error } = result;
    useMemo(() => {
        if (!fetching) {
            console.log(data.getMetrics)
            setMetrics(handleMetrics(data.getMetrics))
        }
    }, [data])

    return (
        <>
            <div className={classes.filterRow}>
                <ul>
                    {metrics.map((metric, i) => {
                        return (
                            <li onClick={() => toggleMetric(i)} key={i}>{metric.name}</li>
                        )
                    })}
                </ul>
            </div>
            <Chart metrics={metrics} />
        </>
    )
};

