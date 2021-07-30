import * as React from 'react';
import { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import Chart from './Chart'
import FilterRow from './FilterRow'
import { Metric } from '../interfaces'
import { metricKeysAdded, metricToggled, getMetricKeys } from '../store/metrics';
import { getUniqueId } from './functions';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split, HttpLink } from '@apollo/client';


const httpLink = new HttpLink({
    uri: 'https://react.eogresources.com/graphql'
});

const wsLink = new WebSocketLink({
    uri: 'ws://react.eogresources.com/graphql',
    options: {
        reconnect: true
    }
});
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);



const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
})
const colors: string[] = [
    '#5e35b1',
    '#3949ab',
    '#1e88e5',
    '#00acc1',
    '#00897b',
    '#2e7d32'
]

const useStyles = makeStyles({
    content: {
        height: '100%'
    },
    chart: {
        height: '600px',
        margin: '0 .5rem'
    }
});
const query = gql`
query{
   getMetrics
}
`
export default () => {
    return (
        <ApolloProvider client={client}>
            <Data />
        </ApolloProvider>
    )
};
const Data: React.FC = ({ children }) => {
    const classes = useStyles();
    const dispatch = useDispatch()

    const [heartBeat, setHeartBeat] = useState<number>(Date.now())
    const metrics: Metric[] = useSelector(getMetricKeys)

    const handleMetrics = (input: string[]): Metric[] => {
        const data: string[] = [...input]
        let result: Metric[] = []
        let colorIndex = 0;
        data.reverse().forEach((name, i) => {
            if (colorIndex >= colors.length) colorIndex = 0
            let metric: Metric = {
                id: getUniqueId(),
                name,
                active: metrics[i] ? metrics[i].active : false,
                unit: '',
                latestValue: 100,
                color: colors[colorIndex]
            }
            colorIndex++
            result.push(metric)
        })
        return result
    }
    const toggleMetric = (i: string) => {
        dispatch(metricToggled(i))
    }
    const { data } = useQuery(query)

    useEffect(() => {
        if (data) {
            if (data.getMetrics) {
                dispatch(metricKeysAdded(handleMetrics(data.getMetrics)))
            }
        }
    }, [data])

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setHeartBeat(Date.now())
    //     }, 1299)
    //     return () => {
    //         clearInterval(timer)
    //     }
    // })

    return (
        <Container className={classes.content} >
            <FilterRow heartBeat={heartBeat} metricKeys={metrics} toggleMetric={toggleMetric}></FilterRow>
            <Paper className={classes.chart}>
                {metrics.length > 0 && <Chart heartBeat={heartBeat} metricObjs={metrics} />}
            </Paper>
        </Container >
    )
};
