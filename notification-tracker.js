const { timeLeftInSeconds } = require('./shared');

module.exports = function NotificationTracker() {
  this.notifiedMons = [];

  this.clearExpiredMons = () => {
    this.notifiedMons = this.notifiedMons.reduce((monArray, currentMon) => {
      if (timeLeftInSeconds(currentMon.despawn) > 0) {
        return monArray.concat(currentMon);
      }
      return monArray;
    }, []);
  };

  this.isEqual = function(notifiedMon, newMon) {
    return (
      notifiedMon.pokemon_id == newMon.pokemon_id &&
      notifiedMon.lat == newMon.lat &&
      notifiedMon.lng == newMon.lng &&
      notifiedMon.despawn == newMon.despawn
    );
  };

  this.hasMonBeenNotified = pokemonReadyForNotification =>
    !(
      this.notifiedMons.length > 0 &&
      this.notifiedMons.find(notifiedMon =>
        this.isEqual(notifiedMon, pokemonReadyForNotification)
      )
    );

  this.markAsNotified = function(pokemonReadyForNotification) {
    this.notifiedMons.push(pokemonReadyForNotification);
  };
};
