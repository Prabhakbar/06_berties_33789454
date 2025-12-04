const express = require("express")
const router = express.Router()
const request = require('request')

router.get('/', (req, res, next) => {

  let city = req.query.city || 'london'

  let apiKey = '6f57e8f4981efe9d93ee0faa66c31ed3'
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

  request(url, function (err, response, body) {
    if(err){
      next(err)
    } else {

      var weather = JSON.parse(body)

      if (weather !== undefined && weather.main !== undefined) {

        var wmsg = 
          'It is ' + weather.main.temp +
          ' degrees in ' + weather.name +
          '! <br> The humidity now is: ' + weather.main.humidity +
          '<br>Wind speed: ' + weather.wind.speed +
          '<br>Description: ' + weather.weather[0].description +
          '<br><br>' +
          '<form method="GET" action="/weather">' +
          'Check another city: <input type="text" name="city" />' +
          '<button type="submit">Search</button>' +
          '</form>';

        res.send(wmsg);

      } else {
        res.send("No data found");
      }

    }
  })
})

module.exports = router
