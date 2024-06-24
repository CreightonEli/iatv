const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const resultsContainer = document.getElementById('results-container')
const detailsSection = document.getElementById('details-section')
const detailsContainer = document.getElementById('details-container')

let searchResultNum = 1
let selectionObj = ""
let selectionURL = ""
let selectionTitle = ""
let selectionCreator = ""
let selectionDesc = ""
let pageNum = 1

function displayResults(movies) {
    resultsContainer.innerHTML = '' // Clear previous results

    if (movies.length === 0) {
        resultsContainer.innerHTML = '<p>No movies found.</p>'
        return
    }

    movies.forEach(movie => {
        let movieElement = document.createElement("li")        

        movieElement.innerHTML = `<h3><a href="#top" onclick="getDetails('${movie.identifier}')"><span class="resultNum">${searchResultNum}.</span> ${movie.title}</a></h3><h4>${movie.creator}</h4>`
        resultsContainer.appendChild(movieElement)
        searchResultNum++
    });
}

// search upon pressing enter
searchInput.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') { // Check if Enter key was pressed
        const query = searchInput.value
        const url = `https://archive.org/advancedsearch.php?q=title:(${query})+AND+mediatype:(movies)+AND+format:(MPEG4)&output=json&rows=100&page=${pageNum}&sort=-downloads`

        searchResultNum = 1

        try {
            const response = await fetch(url)
            const data = await response.json()

            displayResults(data.response.docs)
        } catch (error) {
            console.error('Error fetching data:', error)
            // Handle errors (display an error message, etc.)
        }
    }
});

// search upon clicking search button
searchButton.addEventListener('click', async () => {
    const query = searchInput.value
    const url = `https://archive.org/advancedsearch.php?q=title:(${query})+AND+mediatype:(movies)+AND+format:(MPEG4)&output=json&rows=100&page=${pageNum}&sort=-downloads`

    searchResultNum = 1

    try {
        const response = await fetch(url)
        const data = await response.json()

        displayResults(data.response.docs)
    } catch (error) {
        console.error('Error fetching data:', error)
        // Handle errors (display an error message, etc.)
    }
});

// displays the details of the selected result
function displayDetails() {
    console.log(selectionObj)

    detailsContainer.innerHTML = `
    <div id="video-container"><video id="video-player" src="${selectionURL}" type="video/mp4"></video></div>
    <h1>${selectionTitle}</h1>
    <h2>${selectionCreator}</h2>
    <p>${selectionDesc}</p>
    <div id="file-list-wrapper">
        <h3>Video Files:</h3>
        <ul id="file-list"></ul>
    </div>
    `

    // create file list in case for all .mp4 files in the selected object
    const fileList = document.getElementById('file-list')
    for (let i = 0; i < selectionObj.files_count; i++) {
        if (selectionObj.files[i].name.endsWith('.mp4') && !selectionObj.files[i].name.endsWith('.ia.mp4')) {
            let fileListItem = document.createElement("li")
            fileListItem.innerHTML = `<a href="#top" onclick="changeSource('${selectionObj.files[i].name}')">${selectionObj.files[i].name}</a>`
            fileList.appendChild(fileListItem)
        }
    }
}

// changes the video players source to the selected file from the file list
function changeSource(fileName) {
    const videoPlayer = document.getElementById('video-player')
    
    let fileURL = selectionURL.substring(0, selectionURL.lastIndexOf('/'))
    fileURL += '/' + fileName
    videoPlayer.src = fileURL
}

// gathers useful information on the selected result
async function getDetails(identifier){
    const url = `https://archive.org/metadata/${identifier}`


    try {
        const response = await fetch(url)
        const data = await response.json()
        let fileName = ""

        detailsSection.style = "display: block;"
        
        // reads through files, one at a time until the correct .mp4 file format appears
        for (let i = 0; i < data.files.length; i++) {
            if (data.files[i].name.endsWith('.mp4') && !data.files[i].name.endsWith('.ia.mp4')) {
                fileName = data.files[i].name
                break
            }
        }

        // example: "https://ia802301.us.archive.org/16/items/the-end-of-evangelion-vhs/End%20of%20Evangelion%20(VKLL).mp4"
        selectionObj = data
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
