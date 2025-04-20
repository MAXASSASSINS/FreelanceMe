import React, { useEffect } from 'react'

type LazyLoadingProps = {
  dependencies: unknown[]
}

const useLazyLoading = ({dependencies}: LazyLoadingProps) => {
  // LAZY LOADING THE IMAGES AND VIDEOS
  useEffect(() => {
    const images = document.querySelectorAll<HTMLImageElement>("img[data-src]");
    const videoImages = document.querySelectorAll<HTMLVideoElement>("video[data-poster]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.attributes.getNamedItem("poster")) {
            entry.target.attributes.getNamedItem("poster")!.value =
              entry.target.attributes.getNamedItem("data-poster")!.value;
          } else {
            entry.target.attributes.getNamedItem("src")!.value =
              entry.target.attributes.getNamedItem("data-src")!.value;
          }
          observer.unobserve(entry.target);
        });
      },
      {
        root: document.getElementById("inbox-message-ul-id"),
        rootMargin: "300px",
      }
    );

    images.forEach((image) => {
      observer.observe(image);
    });

    videoImages.forEach((image) => {
      observer.observe(image);
    });

    return () => {
      observer.disconnect();
    };
  }, [...dependencies]);
}

export default useLazyLoading