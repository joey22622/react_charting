import * as React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery as apUseQuery, gql } from '@apollo/client';
import Chart from './Chart'
import { Metric } from '../interfaces'

const client = new ApolloClient({
    uri: 'https://react.eogresources.com/graphql',
    cache: new InMemoryCache(),
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
const query = gql`
query{
   getMetrics
    heartBeat
}
`
export default () => {
    return (
        <ApolloProvider client={client}>
            <FilterRow />
        </ApolloProvider>
    )
};
const FilterRow: React.FC = ({ children }) => {
    const classes = useStyles();

    //GRAPHQL
    const reRunQuery = () => {
        refetch()
        if (data) {
            if (data.heartBeat) setHeartBeat(data.heartBeat)
            console.log(data)
        }
    }
    const { loading, error, data, refetch, networkStatus } = apUseQuery(query)

    // STATES
    const [heartBeat, setHeartBeat] = useState<number>(0)
    const [metrics, setMetrics] = useState<Metric[]>([])

    // HOOKS
    useEffect(() => {
        const timer = setInterval(() => {
            reRunQuery()
        }, 3000)
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
    const handleMetrics = (input: string[]): Metric[] => {
        // console.log(input)
        const data: string[] = [...input]
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
        // console.log(newState)
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

            <Chart heartBeat={heartBeat} metricObjs={metrics.filter(metric => metric.active)} />
        </>
    )
};

