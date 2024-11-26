

/**
 * Fetches image data from a JSON file and calculates which image to display based on the current hour.
 * Preloads the image and updates the DOM with image details.
 */
const setFeaturedImages = async () => {
  try {
    const response = await fetch('/assets/omni/data/features.json');
    const data = await response.json();

    const featureConfigs = [
      {
        'name': 'permanent',
        'button': document.querySelector("#featured-permanent-btn"),
        'item': document.querySelector('#hero-image-permanent'),
        'blurb': false
      },
      {
        'name': 'highlights',
        'button': document.querySelector("#featured-highlight-btn"),
        'item': document.querySelector('#hero-image-highlights'),
        'blurb': false
      },
      {
        'name': 'subjects',
        'button': document.querySelector("#featured-subject-btn"),
        'item': document.querySelector('#hero-image-subjects'),
        'blurb': false
      },
      {
        'name': 'collections',
        'button': document.querySelector("#featured-collections-btn"),
        'item': document.querySelector('#hero-image-collections'),
        'blurb': 'Collection Highlight'
      },
    ];
    const heroCarousel = document.getElementById('hero-carousel');
    //const activeHeroItem = heroCarousel.querySelector('.carousel-item.active');
    const heroBlur = document.querySelector('#hero-blur');

    //const when = new Date().getHours();
    const when = new Date().getMinutes();

    // loop over featuredConfigs
    featureConfigs.forEach((config) => {

      // calculate an index based on the config.name
      //const index = when % data[config.name].length;
      // get a random index from the data based on the current time
      const index = Math.floor(Math.random() * data[config.name].length);


      // the object
      const obj = data[config.name][index];
      const imageUrl = obj.img;
      // set the background image on the hero
      config.item.style.backgroundImage  = `url(${imageUrl})`;

      // test if config.item has a class of .active
      if (config.item.classList.contains('active')) {
        heroBlur.style.backgroundImage = `url(${imageUrl})`;
        heroBlur.style.opacity = 1;
      }

      // set the button text
      config.button.textContent = config.blurb ? config.blurb : obj.text;

      // button links
      if (config.name === "permanent" || config.name === "highlights") {
        config.button.href = obj.url;
      }
      if (config.name === "subjects") {
        config.button.href = `https://guides.library.unt.edu/sb.php?subject_id=${obj.subject_id}`;
        config.button.textContent = `Subject Guides & Databases on ${obj.text}`;
      }
      if (config.name === "collections") {
        config.button.href = obj.url;
        config.button.textContent = `From the Collections: ${obj.text}`;
      }
    });

    /**
    * randomly select on item in a hero's carousel to be the initial item
    */
    const carouselItems = heroCarousel.querySelectorAll('.carousel-item');
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * carouselItems.length);
    // Remove 'active' class from all items if necessary
    carouselItems.forEach(item => item.classList.remove('active'));

    // updated the blurred background accordinginly
    heroBlur.style.backgroundImage = carouselItems[randomIndex].style.backgroundImage;
    // allow future transitions to ease in/out.
    heroBlur.classList.add('hero-transition');


    // Add 'active' class to randomly selected item
    carouselItems[randomIndex].classList.add('active');



    heroCarousel.addEventListener('slide.bs.carousel', event => {
      // carousel starts a slide transition
      heroBlur.style.opacity = 0;
      // get the index of the next item
      const nextItem = event.relatedTarget;
    });
    heroCarousel.addEventListener('slid.bs.carousel', event => {
      // carousel completes a slide transition
      const targetBackgroundImage = event.relatedTarget.style.backgroundImage;
      heroBlur.style.backgroundImage = targetBackgroundImage;
      heroBlur.style.opacity = 1;

    });


  } catch (error) {
    // TODO a default HERO behavior if json isn't fetched and processed.
    console.error('Failed to load image data:', error);
  }
};

/**
 * Initializes the feature setup on DOMContentLoaded.
 */
(() => {
  document.addEventListener('DOMContentLoaded', setFeaturedImages);
})();



