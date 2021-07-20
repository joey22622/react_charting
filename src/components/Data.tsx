import * as React from 'react';
import { useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { createClient, Provider, useQuery, useSubscription } from 'urql';
// import { createClient, defaultExchanges, subscriptionExchange, Provider, Client, useQuery, useSubscription } from 'urql';
import Chart from './Chart'
import { Metric } from '../interfaces'


const client = createClient({
    url: 'https://react.eogresources.com/graphql'
})

// const wsClient = createWSClient({
//     url: 'ws://localhost/graphql',
// });

// const client = createClient({
//     url: 'ws://react.eogresources.com/graphql',
//     exchanges: [
//         ...defaultExchanges,
//         subscriptionExchange({
//             forwardSubscription(operation) {
//                 return {
//                     subscribe: sink => {
//                         const dispose = wsClient.subscribe(operation, sink);
//                         return {
//                             unsubscribe: dispose,
//                         };
//                     },
//                 };
//             },
//         }),
//     ],
// });

const useStyles = makeStyles({
    filterRow: {
        height: '100px',
        width: '1000px',
        background: 'rgba(0,0,0,.6)'
    },
});

const query = `
query{
    getHeartbeat
    getMetrics
}
`
// const subscription = `
//     subscription{
//         newMeasurement{
//             metric
//             at
//             value
//         }
//     }
// `


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
        // console.log(newState[i].active)
        setMetrics(newState)
    }
    // TESTING SUBSCRIPTION
    // interface Response {
    //     newMessages: []
    // }
    // const handleSubscription = () => {
    //     console.log('response')
    //     console.log('response')
    //     // return [response.newMessages, ...measurements];
    // };
    // const [res] = useSubscription({ query: subscription }, handleSubscription);
    // console.log(res, 'aasdfasdf')
    // TESTING SUBSCRIPTION END



    const [result] = useQuery({ query })
    const { fetching, data, error } = result;
    useMemo(() => {
        if (!fetching) {
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
            <Chart metrics={metrics.filter(metric => metric.active)} />
        </>
    )
};

