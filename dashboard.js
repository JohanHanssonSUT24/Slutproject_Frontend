function updateClock() {
  const clockElement = document.getElementById("clock");
  const now = new Date();
  clockElement.textContent = now.toLocaleString("sv-SE");
}
setInterval(updateClock, 1000);
updateClock();

const headline = document.getElementById("headline");
headline.addEventListener("click", () => {
  const newHeadline = prompt("Ändra rubrik", headline.textContent);
  if (newHeadline) {
    headline.textContent = newHeadline;
    localStorage.setItem("dashHeadline", newHeadline);
  }
});
const saveHeader = localStorage.getItem("dashHeadline");
if (saveHeader) {
  headline.textContent = saveHeader;
}

const linkList = document.getElementById("link-list");
const addLink = document.getElementById("add-link");

addLink.addEventListener("click", () => {
  const url = prompt("Ange url för länk");
  const linkName = prompt("Namnge länk");

  if (url && linkName) {
    const link = { url, linkName };
    const links = JSON.parse(localStorage.getItem("links")) || [];
    links.push(link);
    localStorage.setItem("links", JSON.stringify(links));
    renderLinks();
  }
});
function renderLinks() {
  const links = JSON.parse(localStorage.getItem("links")) || [];
  linkList.innerHTML = "";
  links.forEach((link, index) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.textContent = link.linkName;

    const favicon = document.createElement("img");
    favicon.src = `https://www.google.com/s2/favicons?domain=${
      new URL(link.url).hostname
    }`;
    favicon.alt = "Facivon";
    favicon.style.width = "16px";
    favicon.style.height = "16px";
    favicon.style.marginRight = "10px";

    const button = document.createElement("button");
    button.textContent = "Ta bort";
    button.classList.add("remove-btn");
    button.onclick = () => removeLink(index);

    const div = document.createElement("div");
    div.appendChild(favicon);
    div.appendChild(a);
    div.appendChild(button);

    linkList.appendChild(div);
  });
}

function removeLink(index) {
  const links = JSON.parse(localStorage.getItem("links")) || [];
  links.splice(index, 1);
  localStorage.setItem("links", JSON.stringify(links));
  renderLinks();
}
renderLinks();

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = "eefe2ccc9abcc6680f210b6482c66e46";

const searchWeather = document.getElementById("weather-button");
const cityInput = document.getElementById("city-input");
const weatherElement = document.getElementById("weather");
const errorMessage = document.getElementById("error-message");

window.addEventListener("load", () => {
  //getWeatherData("Tvååker");
  getWeatherByGeo();
});

searchWeather.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  } else {
    showError("Vänligen ange en stad.");
  }
});
async function getWeatherByGeo() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        getWeatherByCoordinates(lat, long);
      },
      (error) => {
        console.error("Geolocation error", error);
        getWeatherData("Tvååker");
      }
    );
  } else {
    console.log("Geolocation not supported.");
    getWeatherData("Tvååker");
  }
}
async function getWeatherByCoordinates(lat, long) {
  try {
    weatherElement.innerHTML = "<p>Hämtar väder...</p>";
    errorMessage.textContent = "";

    const url = `${BASE_URL}?lat=${lat}&lon=${long}&units=metric&appid=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    console.error("Error fetching weather!");
    showError("Kunde inte hämta väderdata. Försök igen.");
  }
}
async function getWeatherData(city) {
  if (!city) {
    showError("Ange en stad som finns.");
    return;
  }
  try {
    weatherElement.innerHTML = "<p>Hämtar väder...</p>";
    errorMessage.textContent = "";

    const url = `${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    console.error("Error fetching weather!");
    if (error.message.includes("404")) {
      showError("Staden hittades inte");
    } else {
      showError("Kunde inte hämta väderdata. Försök igen.");
    }
  }
}
function displayWeatherData(data) {
  const cityName = data.name;
  const country = data.sys.country;
  const temperature = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const weatherDescription = data.weather[0].description;
  const weatherIcon = data.weather[0].icon;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  const weatherHTML = `<div class="weather-card">
        <h2>${cityName}, ${country}</h2>
        <div class="weather-main">
            <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}">
            <div class="temperature">${temperature}°C</div>
        </div>
        <p class="weather-description">${weatherDescription}</p>
        <div class="weather-details">
            <p>Feels like: ${feelsLike}</p>
            <p>Humidity: ${humidity}</p>
            <p>Wind speed: ${windSpeed}</p>
        </div>
    </div>`;
  weatherElement.innerHTML = weatherHTML;
}

function showError(message) {
  errorMessage.textContent = message;
  weatherElement.innerHTML = "";
}

function fetchJSONData() {
  console.log("fetchJSONData anropas");
  fetch("https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Leeds")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
      displayTeamData(data);
    })
    .catch((error) => {
      console.error("Unable to fetch data:", error);
    });
}

const searchTeamButton = document.getElementById("search-team");
const teamInput = document.getElementById("team-input");
const teamInfoElement = document.getElementById("team-info");
const lastMatchesElement = document.getElementById("last-matches");

searchTeamButton.addEventListener("click", getTeamData);

async function getTeamData() {
  const teamName = teamInput.value.trim();

  if (!teamName) {
    teamInfoElement.innerHTML = "<p>Vänligen ange ett lagnamn.</p>";
    return;
  }
  teamInfoElement.style.display = "block";
  teamInfoElement.innerHTML = "<p>Laddar laget...</p>";
  try {
    teamInfoElement.innerHTML = "<p>Hämtar lagdata...</p>";

    const teamUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${teamName}`;
    const teamResponse = await fetch(teamUrl);

    if (!teamResponse.ok) {
      throw new Error(`HTTP error! Status: ${teamResponse.status}`);
    }

    const teamData = await teamResponse.json();
    if (teamData.teams && teamData.teams.length > 0) {
      const team = teamData.teams[0];
      displayTeamData(team);
    } else {
      teamInfoElement.innerHTML = "<p>Inget lag hittades.</p>";
    }
  } catch (error) {
    console.error("Error fetching team data", error);
    teamInfoElement.innerHTML = "<p>Kunde inte hämta lagdata. Försök igen.</p>";
  }
}
function displayTeamData(team) {
  let websiteLink = team.strWebsite;
  if (
    websiteLink &&
    !websiteLink.startsWith("http://") &&
    !websiteLink.startsWith("https://")
  ) {
    websiteLink = "https://" + websiteLink;
  }
  const websiteDisplay = websiteLink
    ? `<a href="${websiteLink}" target="_blank">${websiteLink}</a>`
    : "Ingen hemsida tillgänglig";
  teamInfoElement.innerHTML = `
      <h3>${team.strTeam}</h3>
      <p><strong>Land:</strong> ${team.strCountry}</p>
      <p><strong>Arena:</strong> ${team.strStadium}</p>
      <p><strong>Kapacitet:</strong> ${team.intStadiumCapacity} personer</p>
      <p><strong>Liga:</strong> ${team.strLeague}</p>
      <p><strong>Hemsida:</strong>${websiteDisplay}</p>  
      `;
}
window.addEventListener("load", () => {
  fetchRandomBackground();
  const backgroundButton = document.getElementById("background-button");
  console.log(backgroundButton);
  backgroundButton.addEventListener("click", () => {
    fetchRandomBackground();
  });
});

const notesElement = document.getElementById("notes");

notesElement.addEventListener("input", () => {
  const notes = notesElement.value;
  localStorage.setItem("userNotes", notes);
});
window.addEventListener("load", () => {
  const savedNotes = localStorage.getItem("userNotes");
  if (savedNotes) {
    notesElement.value = savedNotes;
  }
});

async function fetchRandomBackground() {
  const UNSPLASH_API_KEY = "ksWzBQids2n7kyusiA2skwqghc0LW9spnl_O_iySdkw";
  try {
    console.log("Hämtar bild...");
    const response = await fetch(
      `https://api.unsplash.com/collections/8860674/photos?client_id=${UNSPLASH_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`API-förfrågan misslyckades: ${response.status}`);
    }
    const data = await response.json();
    console.log("API-svar från Unsplash:", data);
    if (data && data.length > 0 && data[0].urls && data[0].urls.regular) {
      const randomImage = data[Math.floor(Math.random() * data.length)];
      const imageUrl = randomImage.urls.regular;

      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";

      console.log("Bakgrundsbild hämtad och satt:", imageUrl);
    } else {
      console.error("Inget bildobjekt hittades i svaret från Unsplash.");
    }
  } catch (error) {
    console.error("Det gick inte att hämta en bild från Unsplash,", error);
  }
}
