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


const client = new ApolloClient({
    uri: 'https://react.eogresources.com/graphql',
    cache: new InMemoryCache(),
})
const useStyles = makeStyles({
    content: {
        height: '100%'
    },
    chart: {
        height: '500px',
    },
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

    // STATES
    const [heartBeat, setHeartBeat] = useState<number>(Date.now())
    const metrics: Metric[] = useSelector(getMetricKeys)

    // const [metrics, setMetrics] = useState<Metric[]>([])

    // HOOKS
    useEffect(() => {
        const timer = setInterval(() => {
            setHeartBeat(Date.now())
        }, 3000)
        return () => {
            clearInterval(timer)
        }
    })

    // CALLBACKS
    const handleMetrics = (input: string[]): Metric[] => {
        const data: string[] = [...input]
        let result: Metric[] = []
        data.reverse().map((name, i) => {
            let metric: Metric = {
                id: getUniqueId(),
                name,
                active: metrics[i] ? metrics[i].active : false,
                unit: '',
                latestValue: 100
            }
            result.push(metric)
        })
        // console.log(result)
        return result
    }
    const toggleMetric = (i: string) => {
        dispatch(metricToggled(i))
    }
    const { data } = useQuery(query)
    useEffect(() => {
        if (data) {
            if (data.getMetrics) {
                // console.log(handleMetrics(data.getMetrics))
                dispatch(metricKeysAdded(handleMetrics(data.getMetrics)))
                // setMetrics(handleMetrics([...data.getMetrics]))
            }
        }
    }, [data])
    const LoadedChart = () => {

    }

    return (
        <Container className={classes.content} >
            <FilterRow heartBeat={heartBeat} metricKeys={metrics} toggleMetric={toggleMetric}></FilterRow>
            <Paper className={classes.chart}>
                {metrics.length > 0 && <Chart heartBeat={heartBeat} metricObjs={metrics} />}
            </Paper>
        </Container >
    )
};
