"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

async function getShowsByTerm(term) {
  console.log(`Searching for shows with term: ${term}`);
  const response = await axios.get('http://api.tvmaze.com/search/shows', {
    params: { q: term }
  });
  console.log('Shows data:', response.data);
  return response.data.map(result => {
    return {
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: result.show.image ? result.show.image.medium : 'http://tinyurl.com/tv-missing'
    };
  });
}

function populateShows(shows) {
  console.log('Populating shows:', shows);
  $showsList.empty();
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>`
    );
    $showsList.append($show);
  }
}

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  console.log(`Searching for shows with term: ${term}`);
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

async function getEpisodes(showId) {
  console.log(`Fetching episodes for show ID: ${showId}`);
  const response = await axios.get(`http://api.tvmaze.com/shows/${showId}/episodes`);
  console.log('Episodes data:', response.data);
  return response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
}

function populateEpisodes(episodes) {
  console.log('Populating episodes:', episodes);
  const $episodesList = $("#episodesList");
  if ($episodesList.length === 0) {
    console.error("#episodesList element not found in the DOM");
    return;
  }
  $episodesList.empty();
  for (let episode of episodes) {
    const $item = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($item);
  }
  $episodesArea.show();
  console.log("Episodes displayed");
}

$("#showsList").on("click", ".Show-getEpisodes", async function(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  console.log(`Episodes button clicked for show ID: ${showId}`);
  const episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
});
