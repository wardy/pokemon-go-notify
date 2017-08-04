module.exports = {
  timeLeftInSeconds
};

function timeLeftInSeconds(futureTime) {
  const currentUnixTime = Math.floor(Date.now() / 1000);
  return remain = futureTime - currentUnixTime;
}