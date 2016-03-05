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
    console.log("HTTP Request Succeeded: " + jqXHR.status);
    console.log(data);

    var allData = data.concat(params.data.data);
    $('#container').highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'USD to EUR exchange rate over time'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Exchange rate'
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            type: 'area',
            name: 'sadness',
            data: allData.map(function(data){
              if(data.scores){
                return [Date.parse(data.time), data.scores.sadness];
              }
              return [Date.parse(data.time), data.sadness];
            })
        }]
    });
    console.log(allData);
});

})
