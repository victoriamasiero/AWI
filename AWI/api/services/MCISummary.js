var MCISummary = function () {
  this.Initialisation = {}
  for (let k of Object.keys(MCIConfig.Initialisation)) {
    this.Initialisation[k] = ""
  }
  this.start_time = ""
  this.end_time = ""
  this.flight = ""
  this.test = ""
  this.S = []
  this.E = []
}
module.exports = MCISummary;