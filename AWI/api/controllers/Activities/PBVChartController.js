const IDA_format = "HH:mm:ss.SSS"
const IDADataManager = new IDA()
const moment = require("moment")
const atole_format = "DDD-HH:mm:ss"
module.exports = {
    plot: async function(req, res){
        console.log(req)
        var mr = req.query["mr"]
        var test = req.query["test"]
        var charttype = req.query["type"].trim()
        var testtype = test.type
        // TODO Use test for creating the annotations
        console.log(test)
        var matches = mr.match(/[A-Z]\d{4,5}/gm)
        if (matches.length === 2) {
          var aircraft = matches[0]
        }
        var config = PBVChartConfig
        var cursors_config = PBVCursorConfig
        var keys = _.pick(cursors_config[testtype], config[testtype][charttype].cursors)
        var times = _.pick(test, Object.values(keys))
        var par = Object.values(config[testtype][charttype].pars[aircraft])
        var mnemo = Object.keys(config[testtype][charttype].pars[aircraft])
        var inverse_map = par.reduce((o, k, i) => ({...o, [k]: mnemo[i]}), {})
        var axis_config = config[testtype][charttype].axis[aircraft]
        var shift = config[testtype][charttype].shift
        if(shift !==undefined){
          par.push(shift)
        }
        await IDADataManager.OpenSessionSecured()
        await IDADataManager.OpenMR(mr)
        var start = moment(test.TDEB, atole_format)
        var end = moment(test.TFIN, atole_format)
        var day = start.dayOfYear()
        var startt = start.format(IDA_format)
        var endt = end.format(IDA_format)
        var data_res = await IDADataManager.ReadPlotData(mr, startt, endt, par)
        for(let p of par){
          data_res[inverse_map[p]] = data_res[p]
        }
        // Shift Data if there is any shift to do, see with A. Barassin
        if(shift!==undefined){
          for(let p of par){
            data_res[p].x = data_res[shift].y
          }
        }
        var text = `${par.join("/")}, from ${startt} to ${endt}`
        //var annotations = Annotations.generate()
        var shapes = [];
        for(let t of Object.keys(times)){
          if(times[t]!=="99.99.99.999"){
            // Day has to be set (otherwise we have a shifting)
            var x = new moment.utc(times[t], "HH:mm:ss.SSS").dayOfYear(day).toISOString()
          }
          else{
            var x = new moment.utc(startt, IDA_format).toISOString()
          }
          var shape = {}
          shape.opacity = 0.5
          shape.type = "line";
          shape.yref = "paper";
          shape.y0 = -10;
          shape.y1 = 10;
          shape.x0 = x;
          shape.x1 = x;
          // Create new color on the fly ?
          shape.line = {
            width: 1,
            color: "rgba(138, 244, 176, 1)"
          }
          shapes.push(shape)
        }
        var traces = []
        var data_layout = {
          title: text,
          shapes: shapes,
          dragmode: "pan",
        }
        if(shift!==undefined){
          var tickformat = undefined
        }
        else{
          var tickformat = "%H:%M:%S"
        }
        var n = Object.keys(axis_config).length
        var span = 1/n - 5/100
        for(let k of Object.keys(axis_config)){
          var l = parseInt(k)
          for(let p of axis_config[k]){
            traces.push({
              type: "scatter",
              mode: "lines+markers",
              x: data_res[p].x,
              y: data_res[p].y,
              name: p,
              //hovertemplate:`<i>%{x}</i> - ${p}: %{y:.6f}`
              xaxis:`x${l+1}`,
              yaxis:`y${l+1}`
            })
            if(l===0){
              data_layout["xaxis"] = {
                anchor: 'y1',
                domain: [0, 1],
                tickformat: tickformat
              }
              data_layout["yaxis"] = {
                anchor: "x1",
                domain: [0, span]
              }
            }
            else{
              data_layout[`xaxis${l+1}`] = {
                anchor: `y${l+1}`,
                domain: [0, 1],
                tickformat: tickformat
              }
              data_layout[`yaxis${l+1}`] = {
                anchor: `x${l+1}`,
                domain: [l*(span + 5/100), l*(span+5/100)+span],
              }
            }

          }

        }
        res.status(200)
        console.log("Data has been correctly send to browser")
        var data = {
          traces: traces,
          layout: data_layout,
          times: times
        }
        return res.send(data)
    }
}