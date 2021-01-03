const baseUrl = 'https://pokeapi.co/api/v2';
let strengths = [];
let weaknesses = [];

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

document.addEventListener('DOMContentLoaded', function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const pokemonName = urlParams.get('pokemon');
    searchPokemon(pokemonName)
    .then(data => {
        const generalData = data;
        getSpeciesInfo(pokemonName)
        .then(speciesData => {
            data = { ...speciesData, ...generalData }
            console.log(data);

            //General Info
            document.getElementById('pokemon-name').textContent = capitalize(pokemonName);
            document.getElementById('pokemon-id').textContent = "No. " + data.order;

            //Description
            const en_descriptions = data.flavor_text_entries.filter(e => e.language.name === "en")
            const decription = en_descriptions[en_descriptions.length - 1].flavor_text
            document.getElementById('description').textContent = decription;
          

            //Height & Weight
            document.getElementById('height').textContent = data.height / 10 + " m";
            document.getElementById('weight').textContent = data.weight / 10 + " kg"; 

            //Image
            document.getElementById('pokemon-img').src = data.sprites.other['official-artwork']['front_default'];

            //Bar Chart
            loadBarChart(data)

            //Line Chart
            document.getElementById("growth-title").textContent = "Leveling Rate";
            getGrowthInfo(data.growth_rate.name)
            .then(growthData => {
                loadGrowthChart(growthData.levels)   
            })
        })
    })
})

function searchPokemon(name) {
    return new Promise((resolve, reject) => {
        fetch(baseUrl + '/pokemon/' + name)
            .then(res => {
                if (res.status === 200) {
                    resolve(res.json())
                } else if (res.status === 404) {
                    return reject({
                        status: 404,
                        message: "No pokemon named" + name + " is found."
                    })
                } else {
                    reject({
                        status: res.status,
                        message: "Something went wrong..."
                    })
                }
            })
    })
}

function getSpeciesInfo(name) {
    return new Promise((resolve, reject) => {
        fetch(baseUrl + '/pokemon-species/' + name)
            .then(res => {
                if (res.status === 200) {
                    resolve(res.json())
                } else if (res.status === 404) {
                    return reject({
                        status: 404,
                        message: "No pokemon named" + name + " is found."
                    })
                } else {
                    reject({
                        status: res.status,
                        message: "Something went wrong..."
                    })
                }
            })
    })
}


function getGrowthInfo(name) {
    return new Promise((resolve, reject) => {
        fetch(baseUrl + '/growth-rate/' + name)
            .then(res => {
                if (res.status === 200) {
                    resolve(res.json())
                } else if (res.status === 404) {
                    return reject({
                        status: 404,
                        message: "No pokemon named" + name + " is found."
                    })
                } else {
                    reject({
                        status: res.status,
                        message: "Something went wrong..."
                    })
                }
            })
    })
}

function loadGrowthChart(data) {
    let growthChart = document.getElementById('growth-chart');
    let partialData = data.filter((d, index) => (index + 1) % 10 === 0);
    growthChart = new Chart(growthChart, {
        type: 'line',
        data: {
            labels: partialData.map(d => d.level),
            datasets: [{
                label: ['Growth Rate'],
                data: partialData.map(d => d.experience),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)'],
        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Experience Gained'
                        }
                    }
                ],
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Level'
                        }
                    }
                ]
            }
        }
    });
}

function loadBarChart(data) {
    let barChart = document.getElementById('bar-chart');
    const { base_experience, base_happiness, capture_rate } = data;
    barChart = new Chart(barChart, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    data: [base_experience], label: 'Base Experience',
                    backgroundColor: 'rgba(197,48,48,0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    data: [base_happiness], label: 'Base Happiness',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    data: [capture_rate], label: 'Capture Rate',
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

document.getElementById("back").addEventListener("click", () => {
    window.location.replace("/")
});