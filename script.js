// Grab DOM Element for input form
const form = document.querySelector("#searchForm");

// Declare Variables
const apiKey = "b17d60e77dffd2e53cb818dad9614dfb";
const searchHistory = [];
const today = luxon.DateTime.local().toLocaleString({
  weekday: "short",
  month: "short",
  day: "2-digit",
});


// City Search Api Call
const currentWeather = async (userSearch) => {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${userSearch}&units=imperial&appid=${apiKey}`
    );
    $("#queryContent").css("display", "block");
    $("#queryDetails").empty();
    const weatherData = res.data;
    const weatherIcon = weatherData.weather[0].icon;
    const iconURL = `https://openweathermap.org/img/w/${weatherIcon}.png`;
    // Append Data to the document
    let cityEl = $(`
      <h2 id="cityName">
      ${weatherData.name} (${today}) <img src="${iconURL}"/>
      </h2>
      <p>Temperature: ${weatherData.main.temp} °F</p>
      <p>Humidity: ${weatherData.main.temp} %</p>
      <p>Wind Speed: ${weatherData.main.temp} MPH</p>
    `);
    $("#queryDetails").append(cityEl);
    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;
    //UV Index API call
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
      )
      .then(function (uviResponse) {
        let uvIndex = uviResponse.data.value;
        let uvEl = $(`
          <p>UV Index:
            <span id="uvindex">${uvIndex}</span>
          </p>
        `);
        $("#queryDetails").append(uvEl);
        fiveDayForecast(lat, lon);
        //Create UV Index colors
        if (uvIndex < 3) {
          uvindex.classList.add("uviGreen");
        } else if (uvIndex < 6) {
          uvindex.classList.add("uviYellow");
        } else if (uvIndex < 8) {
          uvindex.classList.add("uviOrange");
        } else if (uvIndex < 11) {
          uvindex.classList.add("uviRed");
        } else {
          uvindex.classList.add("ultraviolet");
        }
      });
  };
  
  // 5 day forecast API call
  function fiveDayForecast(lat, lon) {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`
      )
      .then(function (fiveDayResponse) {
        $("#fiveDay").empty();
        for (let i = 1; i < 6; i++) {
          let forecastInfo = {
            date: fiveDayResponse.data.daily[i].dt,
            icon: fiveDayResponse.data.daily[i].weather[0].icon,
            temp: fiveDayResponse.data.daily[i].temp.day,
            humidity: fiveDayResponse.data.daily[i].humidity,
          };
          let forecastDate = luxon.DateTime.fromSeconds(
            forecastInfo.date
          ).toLocaleString({ weekday: "short", month: "short", day: "2-digit" });
          let forecastIcon = `<img src="https://openweathermap.org/img/w/${forecastInfo.icon}.png" />`;
          // Append the 5 day bootstrap cards
          forecastCard = $(`
            <div class="p-3">
              <div class="card text-light bg-transparent">
                <div class="card-body">
                  <p>${forecastDate}</p>
                  <p>${forecastIcon}</p> 
                  <p>Temperature: ${forecastInfo.temp} °F</p>
                  <p>Humidity: ${forecastInfo.humidity} %</p>
                </div>
              </div>
            </div>
          `);
          $("#fiveDay").append(forecastCard);
        }
      });
  }
  
  //Add Event Listener on the input form
  form.addEventListener("submit", function (e) {
    e.preventDefault();
  
    let userSearch = form.elements.query.value.trim();
    currentWeather(userSearch);
    if (!searchHistory.includes(userSearch)) {
      searchHistory.push(userSearch);
      let cityEl = $(`
        <li class="list-group-item bg-transparent text-light text-center pointer history">${userSearch}</li>
      `);
      $("#searchHistory").append(cityEl);
    }
  
    localStorage.setItem("userSearch", JSON.stringify(searchHistory));
    form.elements.query.value = "";
  });
  
  // Add event listener to the LI
  $(document).on("click", ".list-group-item", function () {
    let cityLI = $(this).text();
    currentWeather(cityLI);
  });
  
  // Persist the last userSearch on reload
  $(document).ready(function () {
    let searchArr = JSON.parse(localStorage.getItem("userSearch"));
  
    if (searchArr !== null) {
      let lastSearchEl = searchArr.length - 1;
      let lastCityEl = searchArr[lastSearchEl];
      currentWeather(lastCityEl);
    }
  });