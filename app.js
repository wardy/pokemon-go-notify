const request = require('request');
const PushBullet = require('pushbullet');
const PokemonNames = require('./pokemon-data');
const NotificationTracker = require('./notification-tracker');
const { timeLeftInSeconds } = require('./shared');

const pusher = new PushBullet('o.lSDa9wEEuFFaPGTUDqnmvS3IneqY2KzY');
const notificationTracker = new NotificationTracker();

const config = {
  location: {
    lat: 51.4877871,
    lng: -0.32711629999999997
  },
  tolerance: {
    distanceFromLocation: 5,
    ivPercentage: 1
  }
}

const options = {
  url: 'https://londonpogomap.com/query2.php?token=pleaseDontStealOurData&since=0&mons=3,6,9,59,65,68,76,89,103,106,107,108,112,113,130,131,134,135,136,137,142,143,149,154,157,160,181,196,197,201,212,214,232,233,237,242,247,248',
  headers: { 'referer': 'https://londonpogomap.com/index.html' }
};

function filterShitMons(pokemon) {
  const defaultPokemonToKeep = new Set(['3','6','9','59','65','68','76','89','103','106','107','108','112','113','130','131','134','135','136','137','142','143','149','154','157','160','181','196','197','201','212','214','232','233','237','242','247','248']);
  return defaultPokemonToKeep.has(pokemon.pokemon_id);
}

function filterExpired(pokemon) {
  return timeLeftInSeconds(pokemon.despawn) > 0;
}

function filterDistance(pokemon) {
  return distance(config.location.lat, config.location.lng, pokemon.lat, pokemon.lng) <= config.tolerance.distanceFromLocation;
}

function filterIV({ ivPercentage }) {
  return ivPercentage === -1 || ivPercentage >= config.tolerance.ivPercentage;
}

function distance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function calcIVPercentage(attack, defence, stamina) {
  if (attack < 0 || defence < 0 || stamina < 0 ) {
    return -1;
  } else {
    return Math.floor((attack + defence + stamina) / 45 * 100);
  }
}

function buildPokemonData(pokemon) {
  pokemon.distance = distance(config.location.lat, config.location.lng, pokemon.lat, pokemon.lng);
  pokemon.remainingTime = timeLeftInSeconds(pokemon.despawn);
  pokemon.googleMapsLink = `https://maps.google.com/maps?q=${pokemon.lat},${pokemon.lng}`;
  pokemon.name = PokemonNames[pokemon.pokemon_id];
  pokemon.ivPercentage = calcIVPercentage(parseInt(pokemon.attack), parseInt(pokemon.defence), parseInt(pokemon.stamina))
  return pokemon;
}

function timeToTimeRemainingString(seconds) {
  if (seconds < 0 ) {
    return 'Expired :('
  } else {
    const minutesLeft = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutesLeft < 10 ? '0' + minutesLeft  : minutesLeft }:${secondsLeft < 10 ? '0' + secondsLeft : secondsLeft} left`;
  }
}

function sendMonToPhone(pokemon) {
  request(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${config.location.lat},${config.location.lng}&destinations=${pokemon.lat},${pokemon.lng}&key=AIzaSyC4SHFlG3YKI-CNx1W67L4UVr4NvwiWudY`, function(error, response, body) {
    const data = JSON.parse(body);
    const { name, ivPercentage, googleMapsLink } = pokemon;
    const title = `${name}: ${ivPercentage !== -1 ? ivPercentage : '???'}% | ${pokemon.distance.toFixed(1)}km away | ${timeToTimeRemainingString(timeLeftInSeconds(pokemon.despawn))} | ${data['destination_addresses'][0]}`
    const link = `${googleMapsLink}`
    pusher.link('', title, link, function(error, response) {
      notificationTracker.markAsNotified(pokemon);
    });
  });
}

function main() {
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      const newPokemon = data['pokemons'];

      notificationTracker.clearExpiredMons();
      newPokemon
        .filter(notificationTracker.hasMonBeenNotified)
        .filter(filterExpired)
        .filter(filterShitMons)
        .map(buildPokemonData)
        .filter(filterDistance)
        .filter(filterIV)
        .forEach(sendMonToPhone);
    }
  });
}

setInterval(main, 5000);
