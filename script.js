localStorage.clear(); // Clears the data stored in the localStorage

function findCity() {
    // Retrieves the city name entered by the user and formats it in title case
    var cityName = titleCase($("#cityName")[0].value.trim());

    // Constructs the API URL for fetching weather data for the specified city
    var apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

    // Initiates a fetch request to the API URL
    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                // Updates the city name in the UI with the current date
                $("#city-name")[0].textContent = cityName + " (" + moment().format('M/D/YYYY') + ")";

                // Appends the searched city to the city list in the UI
                $("#city-list").append('<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' + cityName);

                // Retrieves the latitude and longitude coordinates of the city
                const lat = data.coord.lat;
                const lon = data.coord.lon;

                // Stores the city name and its corresponding latitude and longitude coordinates in the localStorage
                var latLonPair = lat.toString() + " " + lon.toString();
                localStorage.setItem(cityName, latLonPair);

                // Constructs the API URL for fetching weather data for the specified latitude and longitude
                apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

                // Initiates a fetch request to the new API URL
                fetch(apiURL).then(function (newResponse) {
                    if (newResponse.ok) {
                        newResponse.json().then(function (newData) {
                            // Calls a function to display the current weather conditions
                            getCurrentWeather(newData);
                        })
                    }
                })
            })
        } else {
            alert("Cannot find city!");
        }
    })
}

// This function gets the info for a city already in the list. It does not need to check whether the city exists as it was already checked when the city was first searched for.
function getListCity(coordinates) {
    // Constructs the API URL for fetching weather data based on the given latitude and longitude coordinates
    apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coordinates[0] + "&lon=" + coordinates[1] + "&exclude=minutely,hourly&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

    // Initiates a fetch request to the API URL
    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                // Calls a function to display the current weather conditions
                getCurrentWeather(data);
            })
        }
    })
}

// This function displays the current weather conditions in the UI
function getCurrentWeather(data) {
    // Adds the "visible" class to the results panel to make it visible
    $(".results-panel").addClass("visible");

    // Updates the UI elements with the current weather data
    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    $("#temperature")[0].textContent = "Temperature: " + data.current.temp.toFixed(1) + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.current.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.current.wind_speed.toFixed(1) + " MPH";
    $("#uv-index")[0].textContent = "  " + data.current.uvi;

    // Sets the UV index background color and text color based on the current value
    if (data.current.uvi < 3) {
        $("#uv-index").removeClass("moderate severe");
        $("#uv-index").addClass("favorable");
    } else if (data.current.uvi < 6) {
        $("#uv-index").removeClass("favorable severe");
        $("#uv-index").addClass("moderate");
    } else {
        $("#uv-index").removeClass("favorable moderate");
        $("#uv-index").addClass("severe");
    }

    // Calls a function to display the future weather forecast
    getFutureWeather(data);
}

// This function displays the future weather forecast in the UI
function getFutureWeather(data) {
    for (var i = 0; i < 5; i++) {
        // Retrieves the weather data for each day of the forecast
        var futureWeather = {
            date: convertUnixTime(data, i),
            icon: "http://openweathermap.org/img/wn/" + data.daily[i + 1].weather[0].icon + "@2x.png",
            temp: data.daily[i + 1].temp.day.toFixed(1),
            humidity: data.daily[i + 1].humidity
        }

        // Updates the UI elements with the future weather data
        var currentSelector = "#day-" + i;
        $(currentSelector)[0].textContent = futureWeather.date;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = futureWeather.icon;
        currentSelector = "#temp-" + i;
        $(currentSelector)[0].textContent = "Temp: " + futureWeather.temp + " \u2109";
        currentSelector = "#hum-" + i;
        $(currentSelector)[0].textContent = "Humidity: " + futureWeather.humidity + "%";
    }
}

// This function applies title case to a city name if there is more than one word.
function titleCase(city) {
    // Converts the city name to lowercase and splits it into an array of words
    var updatedCity = city.toLowerCase().split(" ");
    var returnedCity = "";
    for (var i = 0; i < updatedCity.length; i++) {
        // Capitalizes the first letter of each word
        updatedCity[i] = updatedCity[i][0].toUpperCase() + updatedCity[i].slice(1);
        // Reconstructs the city name with the capitalized words
        returnedCity += " " + updatedCity[i];
    }
    return returnedCity;
}

// This converts the UNIX time that is received from the server.
function convertUnixTime(data, index) {
    // Converts the UNIX timestamp to a date object
    const dateObject = new Date(data.daily[index + 1].dt * 1000);

    // Returns the formatted date string
    return (dateObject.toLocaleDateString());
}

// Event listener for the search button click
$("#search-button").on("click", function (e) {
    e.preventDefault();

    // Calls the function to search for the city
    findCity();

    // Resets the form input
    $("form")[0].reset();
})

// Event listener for the city list item click
$(".city-list-box").on("click", ".city-name", function () {
    // Retrieves the coordinates of the selected city from the localStorage
    var coordinates = (localStorage.getItem($(this)[0].textContent)).split(" ");
    coordinates[0] = parseFloat(coordinates[0]);
    coordinates[1] = parseFloat(coordinates[1]);

    // Updates the city name in the UI with the current date
    $("#city-name")[0].textContent = $(this)[0].textContent + " (" + moment().format('M/D/YYYY') + ")";

    // Calls the function to fetch weather data for the selected city
    getListCity(coordinates);
})
