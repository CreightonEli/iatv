const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const resultsContainer = document.getElementById('results-container')
const detailsSection = document.getElementById('details-section')
const detailsContainer = document.getElementById('details-container')

let searchResultNum = 1
let selectionURL = ""
let selectionTitle = ""
let selectionCreator = ""
let selectionDesc = ""

function displayResults(movies) {
    resultsContainer.innerHTML = '' // Clear previous results

    if (movies.length === 0) {
        resultsContainer.innerHTML = '<p>No movies found.</p>'
        return
    }

    movies.forEach(movie => {
        let movieElement = document.createElement("li")        
        console.log(movie)

        movieElement.innerHTML = `<h3><a onclick="getDetails('${movie.identifier}')"><span class="resultNum">${searchResultNum}.</span> ${movie.title}</a></h3><h4>${movie.creator}</h4>`
        resultsContainer.appendChild(movieElement)
        searchResultNum++
    });
}

searchButton.addEventListener('click', async () => {
    const query = searchInput.value
    const url = `https://archive.org/advancedsearch.php?q=title:(${query})+AND+mediatype:(movies)&output=json`; 

    searchResultNum = 1

    try {
        const response = await fetch(url)
        const data = await response.json()
        console.log(data)
        displayResults(data.response.docs)
    } catch (error) {
        console.error('Error fetching data:', error)
        // Handle errors (display an error message, etc.)
    }
});

function displayDetails() {
    console.log(selectionURL)

    detailsContainer.innerHTML = `
    <video src="${selectionURL}" type="video/mp4"></video>
    <h1>${selectionTitle}</h1>
    <h2>${selectionCreator}</h2>
    <p>${selectionDesc}</p>
    `
}

async function getDetails(identifier){
    const url = `https://archive.org/metadata/${identifier}`


    try {
        const response = await fetch(url)
        const data = await response.json()
        let fileName = ""

        detailsSection.style = "display: block;"

        console.log(data)
        
        // reads through files, one at a time until the correct .mp4 file format appears
        for (let i = 0; i < data.files.length; i++) {
            if (data.files[i].name.endsWith('.mp4') && !data.files[i].name.endsWith('.ia.mp4')) {
                fileName = data.files[i].name
                break
            }
        }

        // example: "https://ia802301.us.archive.org/16/items/the-end-of-evangelion-vhs/End%20of%20Evangelion%20(VKLL).mp4"
        selectionURL = `https://${data.d2}${data.dir}/${fileName}`
        selectionTitle = data.metadata.title
        selectionCreator = data.metadata.creator
        selectionDesc = data.metadata.description

        displayDetails()
    } catch (error) {
        console.error('Error fetching data:', error)
        // Handle errors (display an error message, etc.)
    }   
}
