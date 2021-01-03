const baseUrl = "https://pokeapi.co/api/v2";
let strengths = [];
let weaknesses = [];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}

document.addEventListener("DOMContentLoaded", function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const pokemonName = urlParams.get("pokemon");
  searchPokemon(pokemonName).then((data) => {
    const generalData = data;
    getSpeciesInfo(pokemonName).then((speciesData) => {
      data = { ...speciesData, ...generalData };
      console.log(data);

      //General Info
      document.getElementById("pokemon-name").textContent = capitalize(
        pokemonName
      );
      document.getElementById("pokemon-id").textContent = "No. " + data.order;

      //Type 1
      let type1 = data.types[0].type.name;
      let type2 = "";
      document.getElementById("type1").textContent = capitalize(type1);
      document.getElementById("type1").className = replaceButtonColor(
        "type1",
        type1
      );
      getTypeData(data.types[0].type.url)
        .then((data) => {
          updateDamageRelations(data.damage_relations);
        })
        .then(() => {
          if (data.types.length > 1) {
            // Type 2
            type2 = data.types[1].type.name;
            document.getElementById("type2").textContent = capitalize(type2);
            document.getElementById("type2").className = replaceButtonColor(
              "type2",
              type2
            );
            getTypeData(data.types[1].type.url).then((data) => {
              updateDamageRelations(data.damage_relations);
              cleanUpDamageRelations();
              renderDamageRelations();
            });
          } else {
            document.getElementById("type2").remove();
            cleanUpDamageRelations();
            renderDamageRelations();
          }

          //Description
          const en_descriptions = data.flavor_text_entries.filter(
            (e) => e.language.name === "en"
          );
          const decription =
            en_descriptions[en_descriptions.length - 1].flavor_text;
          document.getElementById("description").textContent = decription;

          // Text-to-Speech
          if (data.types.length > 1) {
            textToSpeech(
              pokemonName +
                ", the " +
                type1 +
                " and " +
                type2 +
                " type pokemon. " +
                decription
            );
          } else {
            textToSpeech(
              pokemonName + ", the " + type1 + "type pokemon. " + decription
            );
          }
        });

      //Height & Weight
      document.getElementById("height").textContent = data.height / 10 + " m";
      document.getElementById("weight").textContent = data.weight / 10 + " kg";

      //Image
      document.getElementById("pokemon-img").src =
        data.sprites.other["official-artwork"]["front_default"];

      //Abilities
      data.abilities.forEach((element) => {
        let str = element.ability.name.replace("-", " ");
        document.getElementById("abilities").textContent +=
          titleCase(str) + "\n";
      });

      //Habitat
      document.getElementById("habitat").textContent = capitalize(
        data.habitat.name
      );

      //Held Items
      data.held_items.forEach((element) => {
        let str = element.item.name.replace("-", " ");
        document.getElementById("items").textContent += titleCase(str) + "\n";
      });

      //Egg Groups
      data.egg_groups.forEach((element) => {
        let str = element.name.replace("-", " ");
        document.getElementById("egg").textContent += titleCase(str) + "\n";
      });

      //Gender Ratio (Pie Chart)
      //not genderless
      if (data.gender_rate !== -1) {
        const femalePercent = (data.gender_rate / 8) * 100;
        loadPieChart(femalePercent);
      } else {
        //if genderless
        document.getElementById("gender-span").innerHTML = "Genderless";
      }

      //Stats Chart
      loadStatsChart(data.stats);

      //Bar Chart
      loadBarChart(data);

      //Line Chart
      document.getElementById("growth-title").textContent = "Leveling Rate";
      getGrowthInfo(data.growth_rate.name).then((growthData) => {
        loadGrowthChart(growthData.levels);
      });
    });
  });
});

function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function playOutput(base64Audio) {
  let arrayBuffer = _base64ToArrayBuffer(base64Audio);
  let audioContext = new AudioContext();
  let outputSource;
  try {
    if (arrayBuffer.byteLength > 0) {
      // 2)
      audioContext.decodeAudioData(
        arrayBuffer,
        function (buffer) {
          // 3)
          audioContext.resume();
          outputSource = audioContext.createBufferSource();
          outputSource.connect(audioContext.destination);
          outputSource.buffer = buffer;
          outputSource.start(0);
        },
        function () {
          console.log(arguments);
        }
      );
    }
  } catch (e) {
    console.log(e);
  }
}

function textToSpeech(string) {
  axios({
    method: "post",
    url: "https://texttospeech.googleapis.com/v1/text:synthesize",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    data: {
      input: {
        text: string,
      },
      voice: {
        languageCode: "en-gb",
        name: "en-US-Wavenet-F",
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "OGG_OPUS",
      },
    },
  }).then((result) => {
    if (result.status === 200) {
      playOutput(result.data.audioContent);
    }
  });
}

function searchPokemon(name) {
  return new Promise((resolve, reject) => {
    fetch(baseUrl + "/pokemon/" + name).then((res) => {
      if (res.status === 200) {
        resolve(res.json());
      } else if (res.status === 404) {
        return reject({
          status: 404,
          message: "No pokemon named" + name + " is found.",
        });
      } else {
        reject({
          status: res.status,
          message: "Something went wrong...",
        });
      }
    });
  });
}

function getSpeciesInfo(name) {
  return new Promise((resolve, reject) => {
    fetch(baseUrl + "/pokemon-species/" + name).then((res) => {
      if (res.status === 200) {
        resolve(res.json());
      } else if (res.status === 404) {
        return reject({
          status: 404,
          message: "No pokemon named" + name + " is found.",
        });
      } else {
        reject({
          status: res.status,
          message: "Something went wrong...",
        });
      }
    });
  });
}

function getGrowthInfo(name) {
  return new Promise((resolve, reject) => {
    fetch(baseUrl + "/growth-rate/" + name).then((res) => {
      if (res.status === 200) {
        resolve(res.json());
      } else if (res.status === 404) {
        return reject({
          status: 404,
          message: "No pokemon named" + name + " is found.",
        });
      } else {
        reject({
          status: res.status,
          message: "Something went wrong...",
        });
      }
    });
  });
}

function loadGrowthChart(data) {
  let growthChart = document.getElementById("growth-chart");
  let partialData = data.filter((d, index) => (index + 1) % 10 === 0);
  growthChart = new Chart(growthChart, {
    type: "line",
    data: {
      labels: partialData.map((d) => d.level),
      datasets: [
        {
          label: ["Growth Rate"],
          data: partialData.map((d) => d.experience),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    backgroundColor: ["rgba(255, 99, 132, 0.2)"],
    borderColor: ["rgba(255, 99, 132, 1)"],
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: "Experience Gained",
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Level",
            },
          },
        ],
      },
    },
  });
}

function loadBarChart(data) {
  let barChart = document.getElementById("bar-chart");
  const { base_experience, base_happiness, capture_rate } = data;
  barChart = new Chart(barChart, {
    type: "bar",
    data: {
      labels: [""],
      datasets: [
        {
          data: [base_experience],
          label: "Base Experience",
          backgroundColor: "rgba(197,48,48,0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          data: [base_happiness],
          label: "Base Happiness",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          data: [capture_rate],
          label: "Capture Rate",
          backgroundColor: "rgba(255, 159, 64, 0.5)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

function loadPieChart(femaleRatio) {
  var pieChart = document.getElementById("pie-chart").getContext("2d");
  pieChart = new Chart(pieChart, {
    type: "pie",
    data: {
      datasets: [
        {
          data: [femaleRatio, 100 - femaleRatio],
          backgroundColor: [
            "rgba(255,137,180, 0.5)",
            "rgba(44, 130, 201, 0.5)",
          ],
          borderColor: ["rgba(255,137,180,1 )", "rgba(44, 130, 201,1)"],
          borderWidth: 1,
        },
      ],
      labels: ["Female", "Male"],
    },
  });
}

function loadStatsChart(data) {
  var statsChart = document.getElementById("stats").getContext("2d");
  statsChart = new Chart(statsChart, {
    type: "radar",
    data: {
      labels: ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"],
      datasets: [
        {
          data: [
            data[0]["base_stat"],
            data[1]["base_stat"],
            data[2]["base_stat"],
            data[3]["base_stat"],
            data[4]["base_stat"],
            data[5]["base_stat"],
          ],
          backgroundColor: "rgba(197,48,48,0.5)",
        },
      ],
    },
    options: {
      scale: {
        ticks: {
          beginAtZero: true,
          min: 0,
          stepSize: 50,
        },
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: function (tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].data[
              tooltipItem.index
            ];
          },
        },
      },
    },
  });
}

function getTypeData(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then((res) => {
      if (res.status === 200) {
        resolve(res.json());
      } else if (res.status === 400) {
        return reject({
          status: 404,
          message: "No pokemon named" + name + " is found.",
        });
      } else {
        reject({
          status: res.status,
          message: "Something went wrong...",
        });
      }
    });
  });
}

function updateDamageRelations(data) {
  data.half_damage_from.forEach((element) => {
    if (strengths.indexOf(element.name) == -1) {
      //push to array if it doesn't exist
      strengths.push(element.name);
    }
  });
  data.double_damage_from.forEach((element) => {
    if (weaknesses.indexOf(element.name) == -1) {
      //push to array if it doesn't exist
      weaknesses.push(element.name);
    }
  });
}

function cleanUpDamageRelations() {
  const oldStrength = strengths.slice();
  strengths = strengths.filter((item) => {
    return !weaknesses.includes(item);
  });
  weaknesses = weaknesses.filter((item) => {
    return !oldStrength.includes(item);
  });
}

function renderDamageRelations() {
  if (strengths.length == 0) {
    document.getElementById("strengths").remove();
  }
  if (weaknesses.length == 0) {
    document.getElementById("weaknesses").remove();
  }

  const defaultClass =
    "inline-flex items-center justify-center mt-2 mr-3 px-5 py-1 border border-transparent bg-red-700 text-white text-base font-medium rounded-md";
  strengths.forEach((element) => {
    //create element and append
    let elem = document.createElement("span");
    elem.textContent = capitalize(element);
    elem.className = defaultClass;
    elem.setAttribute("id", `strength-${element}`);
    document.getElementById("strengths").appendChild(elem);
    elem.className = replaceButtonColor(`strength-${element}`, element);
  });

  weaknesses.forEach((element) => {
    //create element and append
    let elem = document.createElement("span");
    elem.textContent = capitalize(element);
    elem.className = defaultClass;
    elem.setAttribute("id", `weakness-${element}`);
    document.getElementById("weaknesses").appendChild(elem);
    elem.className = replaceButtonColor(`weakness-${element}`, element);
  });
}

function replaceButtonColor(id, type) {
  const colors = {
    grass: "bg-green-600",
    fire: "bg-red-600",
    fighting: "bg-red-900",
    water: "bg-blue-600",
    ice: "bg-blue-200",
    flying: "bg-indigo-300",
    ghost: "bg-indigo-900",
    dragon: "bg-indigo-600",
    normal: "bg-gray-400",
    bug: "bg-green-200",
    electric: "bg-yellow-300",
    ground: "bg-yellow-700",
    rock: "bg-yellow-500",
    psychic: "bg-pink-600",
    poison: "bg-purple-700",
    fairy: "bg-pink-400",
    steel: "bg-gray-500",
    dark: "bg-gray-900",
  };
  const textBlack = ["electric", "flying", "rock", "bug", "normal", "ice"];
  if (!textBlack.includes(type)) {
    return document
      .getElementById(id)
      .className.replace("bg-red-700", colors[type]);
  } else {
    return document
      .getElementById(id)
      .className.replace("bg-red-700 text-white", `${colors[type]} text-black`);
  }
}

document.getElementById("back").addEventListener("click", () => {
  window.location.replace("/");
});
