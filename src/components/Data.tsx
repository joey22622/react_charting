import * as React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { createClient, Provider, useQuery } from 'urql';
import Chart from './Chart'
import { Metric } from '../interfaces'

const client = createClient({
    url: 'https://react.eogresources.com/graphql'
})

const useStyles = makeStyles({
    filterRow: {
        height: '100px',
        width: '1000px',
        background: 'rgba(0,0,0,.6)'
    },
    button: {
        cursor: 'pointer'
    }
});
const query = `
query{
   getMetrics
    heartBeat
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

    //GRAPHQL
    const reRunQuery = () => {
        reexecuteQuery({ requestPolicy: 'network-only' })
        if (data) {
            if (data.heartBeat) setHeartBeat(data.heartBeat)
            console.log(data)
        }
    }
    const [result, reexecuteQuery] = useQuery({ query })
    const { fetching, data, error } = result;


    // STATES
    const [heartBeat, setHeartBeat] = useState<number>(0)
    const [metrics, setMetrics] = useState<Metric[]>([])

    // HOOKS
    useEffect(() => {
        const timer = setInterval(() => {

        }, 60000)
        return () => {
            clearInterval(timer)
        }
    })
    useEffect(() => {
        console.log('heartBeat', heartBeat)
    }, [heartBeat])

    useEffect(() => {
        if (data) {
            console.log('data')
            setHeartBeat(data.heartBeat)
            setMetrics(handleMetrics(data.getMetrics))
        }
    }, [data])

    // CALLBACKS
    const handleMetrics = (data: string[]): Metric[] => {
        let result: Metric[] = []
        data.reverse().map((name, i) => {
            let metric: Metric = {
                name,
                active: metrics[i] ? metrics[i].active : false
            }
            result.push(metric)
        })
        console.log('handleMetrics')
        return result
    }
    const toggleMetric = (i: number) => {
        let newState = [...metrics]
        newState[i].active = !newState[i].active
        console.log(newState)
        setMetrics(newState)
        reRunQuery()
    }
    return (
        <>
            <div className={classes.filterRow}>
                <button onClick={() => reRunQuery()}>click me</button>

                <ul>
                    {metrics.map((metric, i) => {
                        return (
                            <li className={classes.button} onClick={() => toggleMetric(i)} key={i}>{metric.name}, {metric.active ? 'true' : 'false'}</li>
                        )
                    })}
                </ul>
            </div>
            <Chart heartBeat={heartBeat} metrics={metrics.filter(metric => metric.active)} />
        </>
    )
};

