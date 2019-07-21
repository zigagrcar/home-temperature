const key = '';
const city = 3188915;
if (key == '') document.getElementById('temp').innerHTML = ('Remember to add your api key!');

$(document).ready(function (e) {
    google.charts.load('current', { 'packages': ['gauge'] });
    google.charts.setOnLoadCallback(drawChart);

    var myMsg = 0; // where I put my message
    var myMsg2 = 0; // where I put my message

    // gauge variables.

    // Google Charts Stuff
    function drawChart() {

        var data = google.visualization.arrayToDataTable([
            ['My Value', 'Value'],
            ['Temp', 0],
            ['Vlaga', 0],
        ]);

        var options = {
            min: 0, max: 100,
            width: 300, height: 300,
            redFrom: 80.5, redTo: 100,
            yellowFrom: 75.0, yellowTo: 80.0,
            minorTicks: 10
        };

        var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

        chart.draw(data, options);

        setInterval(function () {
            data.setValue(0, 1, myMsg);
            data.setValue(1, 1, myMsg2);
            chart.draw(data, options);
        }, 400);
    }

    // Create a client instance
    client = new Paho.MQTT.Client("m20.cloudmqtt.com", 30903, "web_" + parseInt(Math.random() * 100, 10));

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    var options = {
        useSSL: true,
        userName: "",
        password: "",
        onSuccess: onConnect,
        onFailure: doFail
    }

    // connect the client
    client.connect(options);

    // called when the client connects
    function onConnect() {
        // Once a connection has been made, make a subscription and send a message.
        document.getElementById("connstatus").innerHTML = "Connected";
        console.log("onConnect");
        client.subscribe("sensors/temperature");
        client.subscribe("sensors/humidity");
    }

    function doFail(e) {
        console.log(e);
    }

    // called when the client loses its connection
    function onConnectionLost(responseObject) {
        document.getElementById("connstatus").innerHTML = "Not Connected";
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    // called when a message arrives
    function onMessageArrived(message) {
        if (message.destinationName == "sensors/temperature") {
            myMsg = message.payloadString;
            $('#currentTemp').html(message.payloadString)
        }
        if (message.destinationName == "sensors/humidity") {
            myMsg2 = message.payloadString;
            $('#currentHumi').html(message.payloadString)
        }

    }

    function updateChart() {
        data.setValue(0, 1, 50);
        chart.draw(data, options);
    }

    $(function () {
        try {
            $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
                $('#myip').html(data.ip);
            });
        } catch (e) {
            $('#myip').html("localhost");
        }
    });

    function weatherBallon(cityID) {
        fetch('https://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&appid=' + key)
            .then(function (resp) { return resp.json() }) // Convert data to json
            .then(function (data) {
                drawWeather(data);
            })
            .catch(function () {
                // catch any errors
            });
    }

    function drawWeather(d) {
        var celcius = Math.round(parseFloat(d.main.temp) - 273.15);
        var fahrenheit = Math.round(((parseFloat(d.main.temp) - 273.15) * 1.8) + 32);
        var description = d.weather[0].description;

        document.getElementById('description').innerHTML = description;
        document.getElementById('temp').innerHTML = celcius + '&deg;';
        document.getElementById('location').innerHTML = d.name;

        if (description.indexOf('rain') > 0) {
            document.body.className = 'rainy';
        } else if (description.indexOf('cloud') > 0) {
            document.body.className = 'cloudy';
        } else if (description.indexOf('sunny') > 0) {
            document.body.className = 'sunny';
        } else {
            document.body.className = 'clear';
        }
    }

    weatherBallon(city);
});