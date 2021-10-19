function mapInit() {
  const mymap = L.map('mapid').setView([38.989, -76.937], 11);
  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoiZW55dTA1MTAiLCJhIjoiY2t1dWppNTVtNXpjdDJxbnppcDVqcTNjeiJ9.eONbPxY7fFgd1PTsKlWz2A'
    }
  ).addTo(mymap);
  return mymap; 
}

async function dataHandler() {
  endpoint = 'https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json';
  const request = await fetch(endpoint);
  const restaurants = await request.json();
  const mymap = mapInit();

  function findMatches(wordToMatch, restaurants) {
    return restaurants.filter((place) => {
      // figure out if search matches
      const regex = new RegExp(wordToMatch, 'gi');
      // filter by zip code
      return place.zip.match(regex);
    });
  }

  function displayMatches(event) {
    const matchArray = findMatches(event.target.value, restaurants);
    const limitedList = matchArray.slice(0, 5);

    limitedList.forEach((item, index) => {
      const point = item.geocoded_column_1;
      // exit out if no coordinates
      if (!point || !point.coordinates) {
        return;
      }
      const latLong = point.coordinates;
      const marker = latLong.reverse();
      L.marker(marker).addTo(mymap);
    });
    // pan map to first restaurant
    mymap.setView(limitedList[0].geocoded_column_1.coordinates, 11);
    const html = limitedList
      .map(
        (place) => `  
    <ul class="red">   
        <li ><div class="name"><b>${place.name}</b></div></li>
        <div class="address"><i>${place.address_line_1}</i></div>                
    </ul>
    <br>
        `
      )
      .join('');

    suggestions.innerHTML = html;
  }

  const searchInput = document.querySelector('.search');
  const suggestions = document.querySelector('.suggestions');

  // searchInput.addEventListener("change", displayMatches); no longer needed
  searchInput.addEventListener('input', (evt) => {
    if (!searchInput) {
      limitedList = '';
    }
  });
  searchInput.addEventListener('input', (evt) => {
    displayMatches(evt);
  });
}
window.onload = dataHandler;
