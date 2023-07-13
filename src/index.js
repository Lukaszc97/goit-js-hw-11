import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import * as notiflix from 'notiflix';
const apiKey = "38011218-cb164cf0dde7e2df63faecdfa";

let page = 1; 
const perPage = 20; 
let totalHits = 0; // Całkowita liczba obrazków
let fetchedImages = 0; // Liczba pobranych obrazków

// Przechwytywanie formularza
const searchForm = document.getElementById("search-form");
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value;

  resetGallery(searchQuery);
});



// Wywołanie żądania HTTP
function performSearch(searchQuery) {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  axios
    .get(url)
    .then((response) => { 
      resetGallery
      const images = response.data.hits;
      totalHits = response.data.totalHits;
      fetchedImages += images.length; // Zwiększa liczbę pobranych obrazków

      if (images.length === 0) {
        showNotification("Sorry, there are no images matching your search query. Please try again.");
      } else {
        showNotification (`Hooray! We found ${totalHits} images.`)
        appendImages(images);


        const observer = new IntersectionObserver(handleIntersection, {
          root: null,
          rootMargin: "0px",
          threshold: 1.0,
        });

        // Przypisanie obserwatora do ostatniego obrazka w galerii
        const lastImage = document.querySelector(".gallery .photo-card:last-child");
        observer.observe(lastImage);     
        
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
// Pobranie kolejnej strony z obrazkami
function fetchMoreImages() {
  const searchQuery = document.getElementById("searchQuery").value;
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  axios
    .get(url)
    .then((response) => {
      const images = response.data.hits;
      fetchedImages += images.length;

      if (fetchedImages >= 501) {
        // Blokowanie pobierania po osiągnięciu 500 obrazków
        showNotification("You have reached the maximum limit of 500 images.");
        return;
      }

      if (images.length !== 0) {
        appendImages(images);

        const observer = new IntersectionObserver(handleIntersection, {
          root: null,
          rootMargin: "0px",
          threshold: 1.0,
        });
        const lastImage = document.querySelector(".gallery .photo-card:last-child");
        observer.observe(lastImage);

        if (fetchedImages >= totalHits) {
          showNotification("We're sorry, but you've reached the end of search results.");
        }
        
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// Funkcja resetująca galerię 
function resetGallery(searchQuery) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  fetchedImages = 0; 
  window.scrollTo({
    top: 0,
    left: 0,})
  // Wywołanie funkcji wyszukiwania i otrzymanie danych
  performSearch(searchQuery);
}
// Dodanie kolejnych obrazków do galerii
function appendImages(images) {
  const gallery = document.querySelector(".gallery");

  // Wygenerowanie obrazków i dodanie ich do galerii
  images.forEach((image) => {
    createImageCard(image);
  });

  //SimpleLightbox
  initLightbox();
}

// Tworzenie karty obrazka
function createImageCard(image) {
  const gallery = document.querySelector(".gallery");

  const card = document.createElement("div");
  card.classList.add("photo-card");

  const imageElement = document.createElement("a"); 
  imageElement.href = image.webformatURL; 
  imageElement.classList.add("lightbox-target");

  const imageThumbnail = document.createElement("img");
  imageThumbnail.src = image.webformatURL;
  imageThumbnail.alt = image.tags;
  imageThumbnail.loading = "lazy";

  const info = document.createElement("div");
  info.classList.add("info");

  const likes = createInfoItem("Likes", image.likes);
  const views = createInfoItem("Views", image.views);
  const comments = createInfoItem("Comments", image.comments);
  const downloads = createInfoItem("Downloads", image.downloads);

  info.append(likes, views, comments, downloads);
  imageElement.append(imageThumbnail);
  card.append(imageElement, info);
  gallery.appendChild(card);
}
// Tworzenie informacji
function createInfoItem(label, value) {
  const infoItem = document.createElement("p");
  infoItem.classList.add("info-item");
  infoItem.innerHTML = `<b>${label}: </b>${value}`;

  return infoItem;
}
//SimpleLightbox po dodaniu nowych obrazków
function initLightbox() {
  const lightbox = new SimpleLightbox(".lightbox-target"); 
  lightbox.refresh();
}
function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      page++;
      // Pobranie kolejnej strony z obrazkami
      fetchMoreImages();
    }
  });
}
// Pokazywanie powiadomienia
function showNotification(message) {
  notiflix.Notify.init({ position: "bottom-right" });
  notiflix.Notify.success(message);
}
