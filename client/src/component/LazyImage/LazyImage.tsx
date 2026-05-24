import { useEffect, useState } from "react";
import { Blurhash } from "react-blurhash";
import { IFile } from "../../types/file.types";
import { getCloudinaryTransform, ImageQuality } from "../../utility/cloudinary";

type LazyImageProps = {
  file: IFile;
  lazyLoad?: boolean;
  aspectRatio?: string | number;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  useWebp?: boolean;
  imageQuality?: ImageQuality
};

export const LazyImage = ({
  file,
  lazyLoad = false,
  aspectRatio = "auto",
  objectFit = "cover",
  useWebp = false,
  imageQuality,
}: LazyImageProps) => {
  let { url, blurhash } = file;
  const defaultBlurhash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

  const [loaded, setLoaded] = useState<boolean>(false);

  const handleOnLoad = () => {
    setLoaded(true);
  };

  // if (useWebp) {
  //   console.log(url)
  //   url =  url.replace(/\.[^.]+$/, ".webp");
  // }

  const transform = getCloudinaryTransform(imageQuality ?? "medium");

  url = url.replace("/upload/", `/upload/${transform}/`);

  // console.log(url)
  return (
    <div className="relative h-full">
      <img
        data-src={url}
        className="w-full"
        style={{ aspectRatio: aspectRatio, objectFit: objectFit }}
        src={lazyLoad ? "" : url}
        alt="gig"
        onLoad={handleOnLoad}
      />
      <Blurhash
        className={`!absolute z-20 top-0 left-0`}
        hash={blurhash ? blurhash : defaultBlurhash}
        width="100%"
        height="100%"
        resolutionX={32}
        resolutionY={32}
        punch={1}
        style={!loaded ? { visibility: "visible" } : { visibility: "hidden" }}
      />
    </div>
  );
};
