import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
import "./embla.css";
import { IGig } from "../../types/gig.types";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";
import { RiImage2Line } from "react-icons/ri";

type PropType = {
  gig: IGig;
  options?: EmblaOptionsType;
  lazyLoad: boolean;
  useWebp?: boolean;
};

const MyCarousel: React.FC<PropType> = (props) => {
  const { options, gig, lazyLoad, useWebp } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    ...options,
  });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const objectFit = window.location.href.includes("/gig/details")
    ? "contain"
    : "cover";

  return (
    <section className="embla group relative">
      <div className="embla__viewport aspect-[16/10]" ref={emblaRef}>
        <div className="embla__container aspect-[16/10]">
          {gig.images?.map((image, index) => (
            <div className="embla__slide" key={index}>
              <LazyImage
                file={image}
                lazyLoad={lazyLoad}
                aspectRatio={16 / 10}
                objectFit={objectFit}
                useWebp={useWebp}
              />
            </div>
          ))}
          {gig.video && (
            <div className="embla__slide aspect-[16/10]">
              <LazyVideo
                file={gig.video}
                lazyLoad={lazyLoad}
                aspectRatio={16 / 10}
                objectFit={objectFit}
              />
            </div>
          )}
          {gig.images.length === 0 && !gig.video && (
            <div className="embla__slide">
              <RiImage2Line className="text-no_focus w-full h-full" />
            </div>
          )}
        </div>
      </div>
      {(gig.images?.length > 1 || gig.video) && (
        <div className="group-hover:visible invisible">
          <PrevButton
            onClick={onPrevButtonClick}
            className="absolute bg-[rgba(255,255,255,0.4)] text-dark_grey  rounded-full top-1/2 -translate-y-1/2  left-2 hover:cursor-pointer"
            disabled={prevBtnDisabled}
          />
          <NextButton
            onClick={onNextButtonClick}
            className="absolute bg-[rgba(255,255,255,0.4)] text-dark_grey rounded-full top-1/2 -translate-y-1/2 right-2 hover:cursor-pointer"
            disabled={nextBtnDisabled}
          />
        </div>
      )}
    </section>
  );
};

export default MyCarousel;
