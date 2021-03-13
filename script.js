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


