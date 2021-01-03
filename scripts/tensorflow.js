async function run() {
  const model = await tf.automl.loadImageClassification(
    "./tensorflow/model.json"
  );
  //get image to test
  const image = document.getElementById("result");
  const predictions = await model.classify(image);
  //sort prediction by highest prob, take the first one
  predictions.sort(sortByProperty("prob"));
  //Add prediction result inside output element
  window.location.replace(
    "/results.html?pokemon=" +
      predictions[0]["label"].toLowerCase().replace("_", "-")
  );
  /*Special Cases:
    1. Mr_mime to mr-mime
    2. Nidoran_f to nidoran-f
    3. Nidoran_m to nidoran-m
    */
}

const fileInput = document.getElementById("img");
fileInput.onchange = (event) => {
  if (fileInput.files && fileInput.files[0]) {
    uploadImage(event.target.files[0]);
  }
};

function uploadImage(file) {
  //show loading bar
  document.getElementById("progress-div").removeAttribute("hidden");

  const progressBar = document.getElementById("progress-bar");
  let progressValue = document.getElementById("progress-value");
  let fakeProgress = 0;
  let config = {
    onUploadProgress: (progressEvent) => {
      let percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      const fakeLoading = setInterval(() => {
        if (percentCompleted < 100) {
          if(fakeProgress<99){
            fakeProgress+=1;
            progressBar.style.width = (fakeProgress).toString() + "%";
            progressValue.textContent = (fakeProgress).toString() + "%";
          }
        } else {
          clearInterval(fakeLoading);
          fakeProgress = 100;
          progressBar.style.width = fakeProgress + "%";
          progressValue.textContent = fakeProgress + "%";
          document.getElementById("upload-text").textContent =
            "Upload complete!";
        }
      }, 200);
    },
  };
  let formData = new FormData();
  formData.append("file", file);
  fetch("credentials.json")
    .then((response) => response.json())
    .then((creds) => {
      var CLOUDINARY_URL = creds.cloudinary_url;
      var CLOUDINARY_UPLOAD_PRESET = creds.cloudinary_upload_preset;
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      axios
        .post(CLOUDINARY_URL, formData, config)
        .then((res) => {
          let image = document.getElementById("result");
          image.src = res.data.secure_url;
          document.getElementById("what-poke").removeAttribute("hidden");
        })
        .catch((err) => {
          console.log(err);
        });
    });
}

function sortByProperty(property) {
  return function (a, b) {
    if (a[property] < b[property]) return 1;
    else if (a[property] > b[property]) return -1;

    return 0;
  };
}

document.getElementById("what-poke").addEventListener("click", run);
