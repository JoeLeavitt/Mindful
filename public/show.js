$(function () {

var params = {};
URI(window.location.href).query().split("&").forEach(function(pair){
  var keyVal = pair.split("=");
  params[keyVal[0]] = decodeURIComponent(keyVal[1]);
  if(keyVal[0] == "data" || keyVal[0] == "rec"){
    params[keyVal[0]] = JSON.parse(params[keyVal[0]]);
  }
});

console.log(params);

jQuery.ajax({
    url: "http://localhost:3000/identify",
    type: "GET",
    data: {
        "url": params.url,
        "rec": params.rec,
        "images": JSON.stringify(params.data.images)
    },
})
.done(function(data, textStatus, jqXHR) {
    // console.log(data);

    var allData = data.concat(params.data.data);
    var thisAvg = params.data.avg * 100;
    var thisStdDev = params.data.stddev * 100;
  console.log("ALL DATA: " + allData);
    $('#container').highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: ''
        },
        subtitle: {
        },
        xAxis: {
            type: 'datetime'
         },
        yAxis: {
            title: {
                text: 'Exchange rate'
            },
            plotLines: [{
                color: 'red',
                value: thisAvg,
                width: '2',
                zIndex: '2'
            }, {
                color: 'blue',
                value: thisStdDev,
                width: '2',
                zIndex: '2'
            }],
            min: 0,
            max: 100
        },
        legend: {
            enabled: false
        },
        series: [{
            type: 'area',
            name: 'sadness',
            data: allData.map(function(data){
              if(data.scores){
                return [Date.parse(data.time), data.scores.sadness*100];
              }
              return [Date.parse(data.time), data.sadness*100];
            })
        }]
    });

    var panel = Math.ceil(100 - (params.data.avg / 25));

    $('#container').fadeIn('slow');
    $('#'+panel+'_panel').fadeIn('slow');

    console.log(allData);
});

})
