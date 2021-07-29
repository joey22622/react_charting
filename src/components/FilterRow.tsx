import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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


type ToggleMetric = (i: string) => void
interface Props {
    metricKeys: Metric[],
    heartBeat: number
    toggleMetric: ToggleMetric
}

const FilterRow: React.FC<Props> = ({ metricKeys, toggleMetric }) => {
    const classes = useStyles();

    return (

        <div className={classes.filterRow}>
            {metricKeys.map((metric, i) => {
                const active = {
                    background: '#82ca9d'
                }
                const inactive = {
                    background: 'rgba(100,100,100,.4)'
                }
                return (
                    <Button style={metric.active ? active : inactive} className={classes.button} onClick={() => toggleMetric(metric.id)} key={metric.id}>
                        {metric.name}
                        {/* @ts-ignore */}
                        {metric.active && metric.latestValue && <span className={classes.span}>{metric.latestValue} {metric.unit}</span>}
                    </Button>
                )
            })}
        </div>
    )
};
export default FilterRow
