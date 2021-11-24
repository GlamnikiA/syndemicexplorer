let dateLabel = [],
  confirmedLabel = [],
  comparedConfirmedLabel = [],
  comparedPopulationLabel = [],
  placeLabel = [],
  deathsLabel = [];

let delayed;
let chart;
let options = {
  transitions: {
    show: {
      animations: {
        x: {
          from: 0,
        },
        y: {
          from: 0,
        },
      },
    },
    hide: {
      animations: {
        x: {
          to: 0,
        },
        y: {
          to: 0,
        },
      },
    },
  },

  responsive: true,
  pan: {
    enabled: true,
    mode: 'x',
  },
  zoom: {
    enabled: true,
    mode: 'x', // or 'x' for "drag" version
  },
};
function createEpidemChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: dateLabel,
      datasets: [],
    },

    // Configuration options go here
    options: options,
  });
  console.log(dateLabel);
  chart.update('active');
}

//Creates a graph with confirmed cases for the area
async function confirmedCasesChart(param) {
  await confirmedCasesData(param);
  chart.data.datasets = [];
  console.log('KALLAS DENNA?');

  const newDataset = {
    label: 'Confirmed cases ' + placeLabel,
    backgroundColor: randomColor(),
    borderColor: '#fff',
    data: confirmedLabel,
    fill: true,
    radius: 3,
    hitRadius: 10,
    hoverRadius: 5,
    tension: 0.3,
    opacity: 0.5,
  };
  console.log(newDataset);
  //console.log(comparedConfirmedLabel);
  chart.data.datasets.push(newDataset);
  chart.data.labels = dateLabel;
  console.log(chart.data.datasets.length);
  chart.update();
  // Configuration options go here
}

//Fetches the data of area2Code depending on which dropdown menu value
async function confirmedCasesData(param) {
  const apiUrl = `http://localhost:5000/api/v1/epidemiology/${param}`;
  console.log('urlen ' + apiUrl);
  const response = await fetch(apiUrl);
  const barChartData = await response.json();
  // if (barChartData.length == 0) {
  //   modal.classList.add('is-active');
  // }
  console.log(barChartData);

  const confirmed = barChartData.map((x) => x.confirmed);
  console.log(confirmed);
  const date = barChartData.map((x) => x.date.slice(0, 10));
  const place = barChartData[0].area3_name;

  confirmedLabel = confirmed;
  placeLabel = place;
  dateLabel = date;
  console.log(dateLabel);
  console.log(confirmedLabel);
}
async function compareDataConfirmedChart(param) {
  await compareDataConfirmedData(param);

  const newDataset = {
    label: 'Confirmed cases ' + placeLabel,
    backgroundColor: randomColor(),
    borderColor: '#fff',
    data: comparedConfirmedLabel,
    fill: true,
    radius: 3,
    hitRadius: 10,
    hoverRadius: 5,
    tension: 0.3,
  };
  console.log(comparedConfirmedLabel);
  chart.data.datasets.push(newDataset);
  chart.update();
}

async function deathsConfirmedChart(param) {
  await deathsConfirmedData(param);
  chart.data.datasets = [];
  const newDataset = {
    label: 'Confirmed casesss ' + placeLabel,
    backgroundColor: randomColor(),
    borderColor: '#fff',
    data: deathsLabel,
    fill: true,
    radius: 3,
    hitRadius: 10,
    hoverRadius: 5,
    tension: 0.3,
  };
  console.log(comparedConfirmedLabel);
  chart.data.datasets.push(newDataset);
  chart.update();
}

async function deathsConfirmedData(param) {
  const apiUrl = `http://localhost:5000/api/v1/epidemiology/${param}`;
  const response = await fetch(apiUrl);
  const barChartData = await response.json();
  // if (barChartData.length == 0) {
  //   modal.classList.add('is-active');
  // }
  console.log(barChartData);

  const deaths = barChartData.map((x) => x.confirmed);
  console.log(deaths);
  const date = barChartData.map((x) => x.date.slice(0, 10));
  const place = barChartData[0].area3_name;

  deathsLabel = deaths;
  placeLabel = place;
  dateLabel = date;
  console.log(dateLabel);
}

async function compareDataConfirmedData(param) {
  const apiUrl = `http://localhost:5000/api/v1/epidemiology/${param}`;
  console.log(apiUrl);
  const response = await fetch(apiUrl);
  const barChartData = await response.json();
  // if (barChartData.length == 0) {
  //   modal.classList.add('is-active');
  // }
  console.log(barChartData);

  const confirmed2 = barChartData.map((x) => x.confirmed);
  console.log(confirmed2);

  comparedConfirmedLabel = confirmed2;
}

function deleteAndAddEpidemChart() {
  let element = document.getElementById('myChart');
  element.parentNode.removeChild(element);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'myChart');
  document.getElementById('chartArea').append(canvas);
}

//modal
const modalBgEpi = document.querySelector('.modal-background1');
const modalBgSoc = document.querySelector('.modal-background2');
const modalEpi = document.querySelector('.modalEpidem');
const modalSoc = document.querySelector('.modalSocio');

modalBgEpi.addEventListener('click', () => {
  modalEpi.classList.remove('is-active');
});

modalBgSoc.addEventListener('click', () => {
  modalSoc.classList.remove('is-active');
});