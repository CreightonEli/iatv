const welcomeContainer = document.getElementById('welcome-container')
const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const searchSection = document.getElementById('search-section')
const resultsContainer = document.getElementById('results-container')
const detailsSection = document.getElementById('details-section')
const detailsContainer = document.getElementById('details-container')

let searchResultNum = 1
let selectionObj = ""
let selectionURL = ""
let selectionTitle = ""
let selectionCreator = ""
let selectionDesc = ""
let resultsTotal = 0
let pageNum = 1
let maxPages = 0

// search upon pressing enter
searchInput.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') { // Check if Enter key was pressed
        
        document.getElementById('search-section').scrollIntoView();
        welcomeContainer.classList.add("animate")
        searchResultNum = 1
        resultsTotal = 0
        pageNum = 1
        maxPages = 0
    
        search()
    }
});

// search upon clicking search button
searchButton.addEventListener('click', async () => {
    
    document.getElementById('search-section').scrollIntoView();
    welcomeContainer.classList.add("animate")
    searchResultNum = 1
    resultsTotal = 0
    pageNum = 1
    maxPages = 0

    search()
});

async function search() {
    searchSection.classList.add("show-results")

    const query = searchInput.value
    const encodedQuery = encodeURIComponent(query)
    const url = `https://archive.org/advancedsearch.php?q=(title:${encodedQuery} OR creator:${encodedQuery})+AND+mediatype:(movies)+AND+format:(MPEG4)&output=json&rows=100&page=${pageNum}&sort=-downloads`

    try {
        const response = await fetch(url)
        const data = await response.json()

        resultsTotal = data.response.numFound
        displayResults(data.response.docs)
    } catch (error) {
        resultsContainer.innerHTML = '<h2>Nothing found.</h2><h3>Maybe try something else.</h3>'
        console.error('Error fetching data:', error)
        // Handle errors (display an error message, etc.)
    }
}

function displayResults(movies) {
    resultsContainer.innerHTML = '' // Clear previous results
    console.log(movies)
    if (movies.length === 0) {
        resultsContainer.innerHTML = '<h2>Nothing found.</h2><h3>Try searching for something else.</h3>'
        return
    }

    movies.forEach(movie => {
        let movieElement = document.createElement("li")        
        console.log(movie)
        
        if (movie.date == undefined) {
            movieElement.innerHTML = `<h3><a href="#top" onclick="getDetails('${movie.identifier}')"><span class="resultNum">${searchResultNum}.</span> ${movie.title}</a></h3><h4>${movie.creator}</h4>`
        }
        else {
            movieElement.innerHTML = `<h3><a href="#top" onclick="getDetails('${movie.identifier}')"><span class="resultNum">${searchResultNum}.</span> ${movie.title}</a></h3><h4>${movie.creator} | ${movie.date}</h4>`
        }
        resultsContainer.appendChild(movieElement)
        searchResultNum++
    });
    // create next page buttons at bottom
    maxPages = parseInt(resultsTotal / 100) + 1

    let pageControls = document.createElement("div")
    pageControls.setAttribute("id", "page-controls")
    if (pageNum == maxPages && pageNum == 1) {}
    else {
        pageControls.innerHTML = `<button id="page-back-btn" onclick="pageBack()"><i class="ph ph-caret-left"></i></button><p>Page <span id="page-num">${pageNum}</span> of <span id="max-pages">${maxPages}</span></p><button id="page-next-btn" onclick="pageNext()"><i class="ph ph-caret-right"></i></button>`
    }
    resultsContainer.appendChild(pageControls)
}

// handles pagination
async function pageBack() {
    if (pageNum > 1) {
        if (pageNum == maxPages) {
            let itemRemainder = resultsTotal % 100
            searchResultNum -= itemRemainder + 100
        }
        else {
            searchResultNum -= 200
        }

        pageNum -= 1
        search()
        window.scrollTo(0, 0)
    }
}

async function pageNext() {
    if (pageNum < maxPages) {
        pageNum += 1
        search()
        window.scrollTo(0, 0)
    }
}


// displays the details of the selected result
function displayDetails() {
    console.log(selectionObj)

    detailsContainer.innerHTML = `
    <div id="video-container"><video id="video-player" src="${selectionURL}" type="video/mp4" controls></video></div>
    <h1>${selectionTitle}</h1>
    <h2>${selectionCreator}</h2>
    <div id="description-container"><p>${selectionDesc}</p></div>
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
    
    fileName = fileName.replace("#", "%23")
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
                fileName = encodeURIComponent(fileName)
                break
            }
        }
        
        selectionObj = data
        selectionURL = `https://${data.d2}${data.dir}/${fileName}`
        selectionTitle = data.metadata.title
        selectionCreator = data.metadata.creator
        selectionDesc = data.metadata.description

        searchSection.classList.add("show-details")

        displayDetails()
    } catch (error) {
        console.error('Error fetching data:', error)
        // Handle errors (display an error message, etc.)
    }   
}
