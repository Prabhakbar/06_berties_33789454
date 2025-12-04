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
          `<div style="font-family: Verdana, sans-serif; color: #333;">
            It is <span style="color: #FF5733; font-weight: bold;">${weather.main.temp}°C</span> in <span style="color: #007BFF;">${weather.name}</span>!<br>
            The humidity now is: <span style="color: #28A745;">${weather.main.humidity}%</span><br>
            Wind speed: <span style="color: #17A2B8;">${weather.wind.speed} m/s</span><br>
            Description: <span style="color: #6C757D;">${weather.weather[0].description}</span><br><br>
            <form method="GET" action="/weather">
              Check another city: <input type="text" name="city" />
              <button type="submit">Search</button>
            </form>
          </div>`;

        res.send(wmsg);

      } else {
        res.send("No data found");
      }

    }
  })
})

module.exports = router
