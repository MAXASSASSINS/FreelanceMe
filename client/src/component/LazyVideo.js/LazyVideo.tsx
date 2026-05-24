import { useState } from "react";
import { Blurhash } from "react-blurhash";
import { getPosterForVideo } from "../../utility/util";
import { IFile } from "../../types/file.types";

type LazyVideoProps = {
  file: IFile;
  lazyLoad?: boolean;
  aspectRatio?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
};

export const LazyVideo = ({
  file,
  lazyLoad = false,
  aspectRatio = "auto",
  objectFit = 'contain'
}: LazyVideoProps) => {
  const { blurhash } = file;
  const defaultBlurhash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

  const [loaded, setLoaded] = useState<boolean>(false);

  const handleOnLoad = () => {
    setLoaded(true);
  };

  return (
    <div className="relative h-full">
      <video
        data-poster={getPosterForVideo(file.url)}
        poster={lazyLoad ? "" : getPosterForVideo(file.url)}
        className={`w-full`}
        style={{ aspectRatio: aspectRatio, objectFit: objectFit }}
        src={file.url}
        controls
        preload="none"
      ></video>
      <Blurhash
        className="!absolute z-20 top-0 left-0"
        hash={blurhash ? blurhash : defaultBlurhash}
        width="100%"
        height="100%"
        resolutionX={32}
        resolutionY={32}
        punch={1}
        style={!loaded ? { visibility: "visible" } : { visibility: "hidden" }}
      />
      <img
        src={getPosterForVideo(file.url)}
        alt={file.name}
        className="hidden"
        onLoad={handleOnLoad}
      />
    </div>
  );
};
