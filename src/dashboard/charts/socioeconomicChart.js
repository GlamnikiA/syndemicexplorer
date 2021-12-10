let xAxisLabel = {};
let color = {};
let chartSocio;
let optionsSocio = {
  scales: {},

  responsive: true,
  pan: {
    enabled: true,
    mode: 'x',
  },
  zoom: {
    enabled: true,
    mode: 'x', // or 'x' for "drag" version
  },
  transitions: {
    show: {
      animations: {
        x: {
          from: 0,
          xAxis: true,
        },
        y: {
          from: 0,
          yAxis: true,
        },
      },
    },
    hide: {
      animations: {
        x: {
          to: 0,
          xAxis: true,
        },
        y: {
          to: 0,
          yAxis: true,
        },
      },
    },
  },
};

function deleteAndAddSocioChart() {
  let element = document.getElementById('chart2');
  element.parentNode.removeChild(element);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'chart2');
  document.getElementById('chartArea2').append(canvas);
}

async function createSocioChart() {
  const ctx = document.getElementById('chart2').getContext('2d');
  //Fill gradient

  chartSocio = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: dateLabel,
      datasets: [],
    },
    options: optionsSocio,
  });
  chartSocio.update('active');
}

async function populationSocioChart(param) {
  console.log('DENNA FUNKAR');
  // deleteAndAddSocioChart();
  await populationSocioData(param);

  const newDataSet = {
    label: 'Population ' + placeLabel,
    backgroundColor: color,
    borderColor: '#fff',
    pointBackgroundColor: 'rgb(189,195,199)',
    data: populationLabel,
    fill: true,
    radius: 3,
    hitRadius: 10,
    hoverRadius: 5,
    tension: 0.3,
    opacity: 0.5,
  };

  chartSocio.data.datasets.push(newDataSet);
  chartSocio.data.labels = xAxisLabel;
  chartSocio.update();
}

async function populationSocioData(param) {
  const apiUrl = `http://localhost:5000/api/v1/socio_economics/${param}`;
  console.log(apiUrl);
  const response = await fetch(apiUrl);
  const barChartData = await response.json();
  if (barChartData.length == 0) {
    modalSoc.classList.add('is-active');
  }
  console.log(barChartData);

  const population = barChartData.map((x) => x.value);
  console.log(population);
  const place = barChartData[0].gid;
  const ageGroup = barChartData.map((x) =>
    x.indicator.slice(17, 28).replace('_', ' ')
  );

  populationLabel = population;
  xAxisLabel = ageGroup;
  placeLabel = place;
  console.log(xAxisLabel);
}
async function comparePopulationSocioData(param) {
  const apiUrl = `http://localhost:5000/api/v1/socio_economics/${param}`;
  console.log(apiUrl);
  const response = await fetch(apiUrl);
  const barChartData = await response.json();
  if (barChartData.length == 0) {
    modalSoc.classList.add('is-active');
  }
  console.log(barChartData);

  const population = barChartData.map((x) => x.value);
  const place = barChartData[0].gid;
  console.log(population);

  comparedPopulationLabel = population;
  placeLabel = place;

  //Använd av find metod på array för att kolla om population redan finns

  console.log(dateLabel);
}

async function comparePopulationSocioChart(param) {
  await comparePopulationSocioData(param);

  const newDataset = {
    label: 'Population ' + placeLabel,
    backgroundColor: color,
    borderColor: '#fff',
    data: comparedPopulationLabel,
  };
  console.log(comparedPopulationLabel);
  chartSocio.data.datasets.push(newDataset);
  chartSocio.update();
}

function randomColor() {
  var r = () => (Math.random() * 256) >> 0;
  color = `rgba(${r()}, ${r()}, ${r()}, 0.5)`;
  return color;
}
