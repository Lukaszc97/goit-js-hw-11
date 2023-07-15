const apiKey = "38011218-cb164cf0dde7e2df63faecdfa";

let page = 1;
const perPage = 20;
let totalHits = 0; // Całkowita liczba obrazków
let fetchedImages = 0; // Liczba pobranych obrazków

let lightbox = null;

// Przechwytywanie formularza
const searchForm = document.getElementById("search-form");
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value;

  await resetGallery(searchQuery);
});

// Wywołanie żądania HTTP
async function performSearch(searchQuery) {
  const encodedSearchQuery = encodeURIComponent(searchQuery);
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodedSearchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    const images = response.data.hits;
    totalHits = response.data.totalHits;
    fetchedImages += images.length;

    if (images.length === 0) {
      showNotification("Sorry, there are no images matching your search query. Please try again.");
    } else {
      showNotification(`Hooray! We found ${totalHits} images.`);
      appendImages(images);
      initLightbox();

      const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      });

      const lastImage = document.querySelector(".gallery .photo-card:last-child");
      observer.observe(lastImage);
    }
  } catch (error) {
    console.error(error);
  }
}

// Pobranie kolejnej strony z obrazkami
async function fetchMoreImages() {
  const searchQuery = document.getElementById("searchQuery").value;
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    const images = response.data.hits;
    fetchedImages += images.length;

    if (fetchedImages >= 501) {
      // Blokowanie pobierania po osiągnięciu 500 obrazków
      showNotification("You have reached the maximum limit of 500 images.");
      return;
    }

    if (images.length !== 0) {
      appendImages(images);
      //SimpleLightbox
      initLightbox();
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
  } catch (error) {
    console.error(error);
  }
}
// Funkcja resetująca galerię
async function resetGallery(searchQuery) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  fetchedImages = 0;
  page = 1;
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
  lightbox = null;
  totalHits = 0;
  // Wywołanie funkcji wyszukiwania i otrzymanie danych
  await performSearch(searchQuery);
}


// Dodanie kolejnych obrazków do galerii
function appendImages(images) {
  const gallery = document.querySelector(".gallery");

  // Wygenerowanie obrazków i dodanie ich do galerii
  images.forEach((image) => {
    createImageCard(image);
  });
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
  if (lightbox) {
    lightbox.destroy();
  }

  lightbox = new SimpleLightbox(".lightbox-target");
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
  Notiflix.Notify.init({ position: "bottom-right" });
  Notiflix.Notify.success(message);
}
