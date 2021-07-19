;`    "getMetrics": [
      "oilTemp",
      "tubingPressure",
      "waterTemp",
      "casingPressure",
      "injValveOpen",
      "flareTemp"
    ],
``
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
`

if (!fetching) {
  console.log('WEATHER', result)
}

;`
getMeasurements(input: $metricInfo){
        metric
        at
        value
        unit
    }
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
