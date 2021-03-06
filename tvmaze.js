"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TV_MAZE_API = "http://api.tvmaze.com/";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const response = await axios.get(`${TV_MAZE_API}search/shows`, {
    params: { q: term },
  });

  // let json = JSON.stringify(response)
  let showData = response.data;
  let showsList = [];

  //refactor to use map
  for (let show in showData) {
    //ternery for image.
    if (showData[show].show.image === null) {
      showsList.push({
        id: showData[show].show.id,
        name: showData[show].show.name,
        summary: showData[show].show.summary,
        image: "https://tinyurl.com/tv-missing",
      });
    } else {
      showsList.push({
        id: showData[show].show.id,
        name: showData[show].show.name,
        summary: showData[show].show.summary,
        image: showData[show].show.image.medium,
      });
    }
  }

  return showsList;
  // return [
  //   {
  //     id: response.data[0].show.id,
  //     name: response.data[0].show.name,
  //     summary: response.data[0].show.summary,
  //     image: response.data[0].show.image.medium,
  //   },
  // ];
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes episodes-btn">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  getEpisodesOfShow(shows.id);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

// let episodes = getEpisodesOfShow(shows.id);
console.log($(".episodes-btn"));
$("#showsList").on("click", ".episodes-btn", populateEpisodes);

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );
  let episodeList = [];
  let responseData = response.data;
  for (let episode of responseData) {
    episodeList.push({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    });
  }

  return episodeList;
}

/** Write a clear docstring for this function... */

async function populateEpisodes(evt) {
  evt.preventDefault();
  const $button = $(evt.target);
  let id = $button.closest(".Show").attr("data-show-id");
  console.log(id);

  console.log(evt.target);

  let episodes = await getEpisodesOfShow(id);
  console.log(episodes);
  let $episodesList = $("#episodesList");
  for (let episode of episodes) {
    $(
      `<li class='episode'> ${episode.name} (season ${episode.season}, number ${episode.number})</li>`
    );
    $(".episode").appendTo($episodesList);
  }
}
