attachEvents();
getTolerances();

function handleUpdateLocationButtonClick() {
  document.getElementById('update-location-button').disabled = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocationToServer);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function attachEvents() {
  const touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
  document.getElementById('update-location-button').addEventListener(touchEvent, handleUpdateLocationButtonClick);
  document.getElementById('distance').onchange = handleSliderChange;
  document.getElementById('ivPercentage').onchange = handleSliderChange;
  document.getElementById('updateTolerances').addEventListener(touchEvent, updateTolerances);
}

function handleSliderChange(e) {
  console.log(document.getElementById(e.target.id + 'Value'));
  document.getElementById(e.target.id + 'Value').value = e.target.value;
}

function displayTolerances(tolerances) {
  document.getElementById('distance').value = tolerances.distanceFromLocation;
  document.getElementById('distanceValue').value = tolerances.distanceFromLocation;
  document.getElementById('ivPercentage').value = tolerances.ivPercentage;
  document.getElementById('ivPercentageValue').value = tolerances.ivPercentage;
}

function updateTolerances() {
  const data = JSON.stringify({
    distanceFromLocation: document.getElementById('distanceValue').value,
    ivPercentage: document.getElementById('ivPercentageValue').value
  });

  const xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", window.location.href + "tolerances");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(data);
}

function getTolerances() {
  var xhr = new XMLHttpRequest();

  xhr.onload = function () {
    displayTolerances(JSON.parse(this.responseText))
  };

  xhr.open("GET", window.location.href + "tolerances");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}

function sendLocationToServer(position) {
  document.getElementById('update-location-button').disabled = false
  const data = JSON.stringify({
    "location": {
      "lat": position.coords.latitude,
      "lng": position.coords.longitude
    }
  });

  const xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", window.location.href + "update-position");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(data);
}
