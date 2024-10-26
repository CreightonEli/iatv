const welcomeContainer = document.getElementById('welcome-container')
const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const searchSection = document.getElementById('search-section')
const resultsContainer = document.getElementById('results-container')
const pageControls = document.getElementById("page-controls")
const detailsSection = document.getElementById('details-section')
const detailsContainer = document.getElementById('details-container')

let searchResultNum = 1
let selectionObj = ""
let selectionURL = ""
let thumbnailURL = ""
let selectionTitle = ""
let selectionCreator = ""
let selectionDesc = ""
let selectionId = ""
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

// Makes another request to the api to get thumbnail images for the search results
// which does also make it a lot slower. Not sure if it's worth it so I'm going to 
// make a seperate branch for it. 
// async function getThumbnail(identifier) {
//     const url = `https://archive.org/metadata/${identifier}`

//     try {
//         const response = await fetch(url)
//         const data = await response.json()

//         for (let i = 0; i < data.files_count; i++) {
//             if (data.files[i].name == "__ia_thumb.jpg") {
//                 thumbnailURL = `https://${data.d2}${data.dir}/__ia_thumb.jpg`
//                 return thumbnailURL
//             }
//         }
//         return "Thumbnail not found..."

//     } catch (error) {
//         console.error('Error fetching thumbnail: ', error)
//         // Handle errors (display an error message, etc.)
//     }
// }

/*async*/ function displayResults(movies) {
    resultsContainer.innerHTML = '' // Clear previous results
    pageControls.innerHTML = `<i id="loading-icon" class="ph ph-circle-notch"></i>`

    if (movies.length === 0) {
        resultsContainer.innerHTML = '<h2>Nothing found.</h2><h3>Try searching for something else.</h3>'
        pageControls.innerHTML = ''
        return
    }

    for (const movie of movies) {
        let movieElement = document.createElement("li")

        // get thumbnail
        // thumbnailURL = await getThumbnail(movie.identifier)
        // movieElement.innerHTML = `<a href="#top" onclick="getDetails('${movie.identifier}')"><img class="thumbnail" src="${thumbnailURL}"></a><div><h3><a href="#top" onclick="getDetails('${movie.identifier}')"><span class="resultNum">${searchResultNum}.</span> ${movie.title}</a></h3><h4>${movie.creator}</h4></div>`

        movieElement.innerHTML = `<div><h3><a href="#top" onclick="getDetails('${movie.identifier}')"><span class="resultNum">${searchResultNum}.</span> ${movie.title}</a></h3><h4>${movie.creator}</h4></div>`
        resultsContainer.appendChild(movieElement)
        searchResultNum++
    }
    // create next page buttons at bottom
    maxPages = parseInt(resultsTotal / 100) + 1

    if (pageNum == maxPages && pageNum == 1) {
        pageControls.innerHTML = ''
    }
    else {
        pageControls.innerHTML = `<button id="page-back-btn" onclick="pageBack()"><i class="ph ph-caret-left"></i></button><p>Page <span id="page-num">${pageNum}</span> of <span id="max-pages">${maxPages}</span></p><button id="page-next-btn" onclick="pageNext()"><i class="ph ph-caret-right"></i></button>`
    }
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
    detailsContainer.innerHTML = `
    <div id="video-container"><video id="video-player" src="${selectionURL}" type="video/mp4" controls></video></div>
    <h1>${selectionTitle}</h1>
    <h2>${selectionCreator}</h2>
    <!--<a href="${selectionURL}" id="download-video"><i class="ph ph-download-simple"></i></a>-->
    <div id="description-container"><p>${selectionDesc}</p></div>
    <div id="file-list-wrapper">
        <h3>Other Videos:</h3>
        <ul id="file-list"></ul>
    </div>
    `
    // Download button nonsense code //
    // 
    // // Attach the event listener for the download functionality
    // document.querySelector('#download-video').addEventListener('click', function(event) {
    //     event.preventDefault(); // Prevent default behavior

    //     const videoUrl = event.currentTarget.href; // Get the external video URL
    //     const videoTitle = document.querySelector('h1').textContent.trim(); // Use the video title as the filename

    //     // Fetch the video data as a Blob
    //     fetch(videoUrl, {
    //         mode: 'cors' // Ensure CORS mode is enabled
    //     })
    //     .then(response => response.blob())
    //     .then(blob => {
    //         const downloadLink = document.createElement('a');
    //         const objectUrl = window.URL.createObjectURL(blob);

    //         downloadLink.href = objectUrl;
    //         downloadLink.download = videoTitle + '.mp4'; // Set the file name with proper extension
    //         document.body.appendChild(downloadLink);
    //         downloadLink.click(); // Trigger the download
    //         downloadLink.remove(); // Clean up

    //         // Release the object URL after download
    //         window.URL.revokeObjectURL(objectUrl);
    //     })
    //     .catch(err => {
    //         console.error('Error fetching and downloading the video:', err);
    //     });
    // });


    // create file list in case for all .mp4 files in the selected object
    const fileList = document.getElementById('file-list')
    for (let i = 0; i < selectionObj.files_count; i++) {
        if (selectionObj.files[i].name.endsWith('.mp4') && !selectionObj.files[i].name.endsWith('.ia.mp4')) {
            let fileListItem = document.createElement("li")
            console.log(selectionObj.files)
            fileListItem.innerHTML = `<a href="#top" onclick="changeSource('${selectionObj.files[i].name}')">${selectionObj.files[i].name.slice(0, -4)}</a>`
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
        console.log(data)
        selectionObj = data
        selectionURL = `https://${data.d2}${data.dir}/${fileName}`
        selectionTitle = data.metadata.title
        selectionCreator = data.metadata.creator
        selectionDesc = data.metadata.description
        selectionId = data.metadata.identifier

        searchSection.classList.add("show-details")

        displayDetails()
    } catch (error) {
        console.error('Error fetching data:', error)
        // Handle errors (display an error message, etc.)
    }   
}
