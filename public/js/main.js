$(function () {
  var pulse = io.connect('/pulse'),
      pulse_data = [],
      raw_plot,
      output_plot,
      totalPoints = 100,
      lastPeak = Date.now(),
      peakDiffs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      freq = 0,
      y_min = 0,
      y_max = 0;

  pulse.on('pulse', function (data) {
    pulse_data.push(data)
    pulse_data.shift();


    raw_plot.setData([ parse_data() ]);
    raw_plot.draw();
    output_plot.setData([ parse_data() ]);
    output_plot.draw();

      if ((data > pulse_data[totalPoints - 2] - .2) & (data > pulse_data[totalPoints - 7] - .2)){
        freq = Date.now() - lastPeak;
        lastPeak = Date.now();

        peakDiffs.push(freq);
        peakDiffs.shift();


        var peak_sum = 0;
        
        for (var i = 0; i < peakDiffs.length; i++) {
          peak_sum += peakDiffs[i];
        }

        /*
        console.log('peak_sum =' + peak_sum);
        console.log('Avg =' + (peak_sum / peakDiffs.length));
        console.log('Scaled =' + ((peak_sum / peakDiffs.length) / 1000));
        console.log('Unknown =' + (60 / ((peak_sum / peakDiffs.length) / 1000)));
        console.log('next');
        */

        heart_rate = parseInt(60 / ((peak_sum / peakDiffs.length) / 1000), 10);

        $('#heartrate').html(heart_rate);
        $('#output_heartrate').html(heart_rate);
      }
    });

  // pre-fill pulse_data with all zeroes
  while (pulse_data.length < totalPoints) {
    pulse_data.push(0);
  }

  var parse_data = function () {
    var res = [],
        min = max = pulse_data[0];

    for (var i = 0; i < pulse_data.length; ++i) {
      if (max < pulse_data[i]) { max = pulse_data[i]; }
      if (min < pulse_data[i]) { min = pulse_data[i]; }

      res.push([i, pulse_data[i] ])
    }

    //reset graph center if line is outside min/max range
    if (min - 10 < y_min || max + 5 > y_max) {
      setup(min - 10, max + 5);
    }

    return res;
  }

  var setup = function (min, max) {
    //save min/max to global cars so we can center the graph
    y_min = min;
    y_max = max;

    var options = {
        colors: [ '#333' ],
        series: {
          shadowSize: 0,
        },
        yaxis: { show: false, min: 0, max: 120 },
        xaxis: { show: false },
        grid: { show: true, borderWidth: 0 },
    };

    raw_plot = $.plot($("#placeholder"), [ parse_data() ], options);
    output_plot = $.plot($("#output_placeholder"), [ parse_data() ], options);
  }

  $('#placeholder').css({
    //width: '100%',
    height: $('body').height() + 'px'
  })

  $('#output_placeholder').css({
    //width: '100%',
    height: $('body').height() + 'px'
  })

  setup(y_min, y_max);
});