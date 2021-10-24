import './sass/main.scss';
import './js/refs.js';
import './basicLightbox.min.css';
import './js/basicLightbox.min.js';
import './js/fullSizeImages.js';


import debounce from 'lodash.debounce';
import imagesTemplate from './templates/imageCard.hbs';
import ApiImagesService from './js/apiService.js';
import refs from './js/refs.js';
import { onErrorEmptyInput, onErrorNoSuchMatches } from './js/notify.js';

const { bodyEL, galleryEL, formEL, inputEL, loadMoreBtnEL, sentinelEL } = refs;

const apiImageService = new ApiImagesService();

formEL.addEventListener('input', debounce(onImgSearch, 500));

function onImgSearch(e) {
  e.preventDefault();

  apiImageService.query = inputEL.value;

  if (apiImageService.query === '') {
    return onErrorEmptyInput();
  }

  apiImageService.resetPage();
  onClearGallery();
  onFetchImages();
}

function onFetchImages() {
  apiImageService
    .onFetchImages()
    .then(images => {
      renderImages(images.hits);
    })
    .catch(onFetchError);
}

function onFetchError(error) {
  alert(error);
}

function renderImages(images) {
  if (images.length === 0) {
    return onErrorNoSuchMatches();
  }

  galleryEL.insertAdjacentHTML('beforeend', imagesTemplate(images));
}

function onClearGallery() {
  galleryEL.innerHTML = '';
}

function onLoadMoreBtnClick() {
  onFetchImages();

  const options = {
    top: null,
    behavior: 'smooth',
  };

  options.top = window.pageYOffset + document.documentElement.clientHeight;
  setTimeout(() => {
    window.scrollTo(options);
  }, 1000);
}

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && apiImageService.query !== '') {
      apiImageService.onFetchImages().then(images => {
        renderImages(images.hits);
        apiImageService.incrementPage();
      });
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});

observer.observe(sentinelEL);
