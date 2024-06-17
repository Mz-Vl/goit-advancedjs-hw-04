const API_KEY = '986738-8cdc2a7fdebdc51acfa5607bc';
const BASE_URL = 'https://pixabay.com/api/';
let currentPage = 1;
let currentQuery = '';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', fetchImages);
loadMoreBtn.style.display = 'none';

const lightbox = new SimpleLightbox('.gallery a');

function onSearch(event) {
  event.preventDefault();
  currentQuery = event.currentTarget.elements.searchQuery.value.trim();
  currentPage = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  if (currentQuery === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search query.',
    });
    return;
  }

  fetchImages();
}

async function fetchImages() {
  const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(currentQuery)}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.hits.length === 0) {
      iziToast.warning({
        title: 'Warning',
        message: 'Sorry, there are no images matching your search query. Please try again.',
      });
      return;
    }

    renderGallery(data.hits);
    currentPage += 1;

    if (currentPage > Math.ceil(data.totalHits / 40)) {
      loadMoreBtn.style.display = 'none';
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      loadMoreBtn.style.display = 'block';
    }

    if (currentPage === 2) {
      iziToast.success({
        title: 'Hooray!',
        message: `We found ${data.totalHits} images.`,
      });
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
    });
  }
}

function renderGallery(images) {
  const markup = images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
        <a href="${largeImageURL}" class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
                <p class="info-item"><b>Likes:</b> ${likes}</p>
                <p class="info-item"><b>Views:</b> ${views}</p>
                <p class="info-item"><b>Comments:</b> ${comments}</p>
                <p class="info-item"><b>Downloads:</b> ${downloads}</p>
            </div>
        </a>
    `).join('');

  gallery.insertAdjacentHTML('beforeend', markup);


  lightbox.refresh();
}
