import React, { useEffect, useState, Suspense } from 'react';

// Загрузка компонента Image лениво
const LazyImage = React.lazy(() => import('./image'));

const accessKey = "gMHmuMmvb0VSj4E2xw_-HkMOJBrZkUSrJO4EmU8ENdI";

function App() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    performance.mark('start-fetch-images');
    fetch(`https://api.unsplash.com/photos/random?client_id=${accessKey}&count=10`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
          performance.mark('end-fetch-images');
          performance.measure('fetch-images', 'start-fetch-images', 'end-fetch-images');
          const measure = performance.getEntriesByName('fetch-images')[0];
          console.log(`Images fetched in ${measure.duration}ms`);
        }
      })
      .catch(error => {
        console.error("Error fetching images:", error);
      });
  }, []);

  function LazyImageWithObserver({ src, alt }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 }); // Добавлен threshold для лучшего контроля за моментом отображения

      observer.observe(document.querySelector(`[data-src="${src}"]`));

      return () => observer.disconnect();
    }, [src]);

    useEffect(() => {
      if (isVisible) {
        const startRender = `start-render-${src}`;
        const endRender = `end-render-${src}`;
        performance.mark(startRender);

        const imageElement = document.querySelector(`[data-src="${src}"] img`);
        if (imageElement) {
          imageElement.onload = () => {
            performance.mark(endRender);
            performance.measure(`render-${src}`, startRender, endRender);
            const measure = performance.getEntriesByName(`render-${src}`)[0];
            console.log(`${alt} rendered in ${measure.duration}ms`);
          };
        }
      }
    }, [isVisible, src, alt]);

    return (
      <div className="lazy-image" data-src={src} style={{ minHeight: '100px' }}>
        {isVisible ? <LazyImage src={src} alt={alt} /> : null}
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <Suspense fallback={<div>Loading...</div>}>
        {images.map((image, index) => (
          <LazyImageWithObserver key={index} src={image.urls.regular} alt={image.alt_description} />
        ))}
      </Suspense>
    </div>
  );
}

export default App;
