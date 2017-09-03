const touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
const updateLocationButton = document.getElementById('update-location-button');
updateLocationButton.addEventListener(touchEvent, handleUpdateLocationButtonClick);

function handleUpdateLocationButtonClick() {
  updateLocationButton.disabled = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocationToServer);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function sendLocationToServer(position) {
  updateLocationButton.disabled = false
  const data = JSON.stringify({
    "location": {
      "lat": position.coords.latitude,
      "lng": position.coords.longitude
    }
  });

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", window.location.href + "update-position");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("postman-token", "833e336f-6b36-9a34-88fb-ef919dadf657");

  xhr.send(data);
}
