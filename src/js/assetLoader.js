export const imageCache = {};

export function preloadImages(imagePaths, callback) {
  let finishedImages = 0;
  const totalImages = imagePaths.length;

  if (totalImages === 0) {
    callback();
    return;
  }

  function handleFinished(path, error) {
    finishedImages++;

    if (error) {
      console.warn(`Could not load image: ${path}`);
    }

    if (finishedImages === totalImages) {
      callback(); // Starte das Spiel, wenn alle Bilder geladen sind
    }
  }

  imagePaths.forEach((path) => {
    const img = new Image();
    img.onload = () => {
      handleFinished(path, false);
    };
    img.onerror = () => {
      handleFinished(path, true);
    };
    img.src = path;
    imageCache[path] = img;
  });
}
