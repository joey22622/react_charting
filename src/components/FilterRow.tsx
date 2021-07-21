import * as React from 'react';
import { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import Chart from './Chart'
import { Metric } from '../interfaces'
import Button from '@material-ui/core/Button';



const useStyles = makeStyles({

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

const query = gql`
query{
   getMetrics
    heartBeat
}
`

type ToggleMetric = (i: number) => void
interface Props {
    metrics: Metric[],
    heartBeat: number
    toggleMetric: ToggleMetric
}

const FilterRow: React.FC<Props> = ({ heartBeat, metrics, children, toggleMetric }) => {
    const classes = useStyles();

    const query = gql`
        query{
        getMetrics
            heartBeat
        }
    `


    return (
        <div className={classes.filterRow}>
            {metrics.map((metric, i) => {
                return (
                    <Button className={classes.button} onClick={() => toggleMetric(i)} key={i}>
                        {metric.name}
                    </Button>
                )
            })}
        </div>
    )
};
export default FilterRow
