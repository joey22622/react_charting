import * as React from 'react';
import { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import Chart from './Chart'
import FilterRow from './FilterRow'
import { Metric } from '../interfaces'
import Button from '@material-ui/core/Button';


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
        // background: 'green'
    },
    filterRow: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    button: {
        background: 'rgba(0,0,0,.2)',
        flexGrow: 1,
        margin: '1rem .5rem',
        transition: '.2s',
        color: 'white',
        padding: '.5rem 1rem',
        textTransform: 'none'
    }
});
const fluidHeight = {
    height: '100%'
}
const query = gql`
query{
   getMetrics
    heartBeat
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

    //GRAPHQL
    const reRunQuery = () => {
        refetch()
        if (data) {
            if (data.heartBeat) setHeartBeat(data.heartBeat)
        }
    }
    const { loading, error, data, refetch, networkStatus } = useQuery(query)

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
    }, [heartBeat])

    useEffect(() => {
        if (data) {
            setHeartBeat(data.heartBeat)
            setMetrics(handleMetrics(data.getMetrics))
        }
    }, [data])

    // CALLBACKS
    const handleMetrics = (input: string[]): Metric[] => {
        const data: string[] = [...input]
        let result: Metric[] = []
        data.reverse().map((name, i) => {
            let metric: Metric = {
                name,
                active: metrics[i] ? metrics[i].active : false
            }
            result.push(metric)
        })
        return result
    }
    const toggleMetric = (i: number) => {
        let newState = [...metrics]
        newState[i].active = !newState[i].active
        setMetrics(newState)
        reRunQuery()
    }

    return (
        <Container className={classes.content} >
            {/* <Grid container>
                <Grid style={fluidHeight} item xs={12}> */}
            {/* <Paper> */}
            <FilterRow heartBeat={heartBeat} metrics={metrics} toggleMetric={toggleMetric}></FilterRow>
            {/* <div className={classes.filterRow}>
                {metrics.map((metric, i) => {
                    return (
                        <Button className={classes.button} onClick={() => toggleMetric(i)} key={i}>
                            {metric.name}
                        </Button>
                    )
                })}
            </div> */}
            {/* </Paper> */}
            {/* </Grid> */}
            {/* <Grid className={classes.chart} item xs={12}> */}
            <Paper className={classes.chart}>
                <Chart heartBeat={heartBeat} metricObjs={metrics.filter(metric => metric.active)} />
            </Paper>
            {/* </Grid> */}
            {/* </Grid> */}
        </Container >
    )
};

