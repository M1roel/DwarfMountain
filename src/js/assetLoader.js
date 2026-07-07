export const imageCache = {};

export function preloadImages(imagePaths, callback) {
  let loadedImages = 0;
  const totalImages = imagePaths.length;

  imagePaths.forEach((path) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      loadedImages++;
      if (loadedImages === totalImages) {
        callback(); // Starte das Spiel, wenn alle Bilder geladen sind
      }
    };
    imageCache[path] = img;
  });
}
