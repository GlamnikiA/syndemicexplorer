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

nv.addGraph(function () {
  var chart = nv.models.lineChart();

  chart.xAxis.axisLabel('Time (ms)').tickFormat(d3.format(',r'));

  chart.yAxis.axisLabel('Voltage (v)').tickFormat(d3.format('.02f'));

  d3.select('#chartTwo svg')
    .datum(sinAndCos())
    .transition()
    .duration(500)
    .call(chart);

  nv.utils.windowResize(function () {
    d3.select('#chartTwo svg').call(chart);
  });

  return chart;
});
function sinAndCos() {
  var sin = [],
    cos = [];

  for (var i = 0; i < 100; i++) {
    sin.push({ x: i, y: Math.sin(i / 10) });
    cos.push({ x: i, y: 0.5 * Math.cos(i / 10) });
  }

  return [
    {
      values: sin,
      key: 'Sine Wave',
      color: '#ff7f0e',
    },
    {
      values: cos,
      key: 'Cosine Wave',
      color: '#2ca02c',
    },
  ];
}
