import * as React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery, gql } from '@apollo/client';
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
        padding: '.5rem',
        textTransform: 'none'
    },
    span: {
        transition: '.1s',
        marginLeft: '.2rem',
        fontWeight: 700,
    }
});


type ToggleMetric = (i: number) => void
interface Props {
    metricKeys: Metric[],
    heartBeat: number
    toggleMetric: ToggleMetric
}

const FilterRow: React.FC<Props> = ({ heartBeat, metricKeys, children, toggleMetric }) => {
    const [latestValues, setLatestValues] = useState({})
    const classes = useStyles();
    //     let query = gql`query{
    //    getLastKnownMeasurement(metricName:"oilTemp"){
    //     metric
    //     value
    //     unit
    //   }
    // }`
    //     const buildQuery = (metrics: Metric[]) => {
    //         if (metrics.length > 0) {
    //             let gqlBody = ``
    //             metrics.forEach(metric => {
    //                 gqlBody += `${metric.name}:getLastKnownMeasurement(metricName: "${metric.name}"){
    //                 metric
    //                 value
    //                 unit
    //             } 
    //             `
    //             })
    //             query = gql`query{ ${gqlBody} }`
    //         }
    //     }

    //     buildQuery(metrics)
    //     const res = useQuery(query)
    //     useEffect(() => {
    //         res.refetch()
    //     }, [heartBeat])
    //     useEffect(() => {
    //         setLatestValues(res.data)
    //     }, [res.data])

    return (
        <>
        </>
        // <div className={classes.filterRow}>
        //     {metricKeys.map((metric, i) => {
        //         const active = {
        //             background: '#82ca9d'
        //         }
        //         const inactive = {
        //             background: 'rgba(100,100,100,.4)'
        //         }
        //         return (
        //             <Button style={metric.active ? active : inactive} className={classes.button} onClick={() => toggleMetric(i)} key={metric.id}>
        //                 {metric.name}
        //                 {/* @ts-ignore */}
        //                 {metric.active && latestValues[metric.name] && <span className={classes.span}>{latestValues[metric.name].value} {latestValues[metric.name].unit}</span>}
        //             </Button>
        //         )
        //     })}
        // </div>
    )
};
export default FilterRow
