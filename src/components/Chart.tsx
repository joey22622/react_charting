import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Provider, createClient, useQuery } from 'urql';

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
query{
    getMeasurements(
    input: {
        metricName:"oilTemp"
        before:1626664014782
        after: 1626662214782
    }){
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
    const [result] = useQuery({
        query
    });
    const { fetching, data, error } = result;
    if (!fetching) {
        console.log('MEASUREMENTS', result)
    }
    return (
        <div className={classes.chart}>{children}</div>
    )
};
