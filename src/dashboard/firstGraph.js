var data = [
  {
    key: 'ExampleData',
    values: [
      {
        label: 'Dead',
        value: 10,
      },
      {
        label: 'Closed',
        value: 20,
      },
      {
        label: 'Infected',
        value: 50,
      },
    ],
  },
];

nv.addGraph(function () {
  var chart = nv.models
    .discreteBarChart()
    .x(function (d) {
      return d.label;
    })
    .y(function (d) {
      return d.value;
    });

  d3.select('#chart svg').datum(data).call(chart);

  nv.utils.windowResize(chart.update);

  return chart;
});
