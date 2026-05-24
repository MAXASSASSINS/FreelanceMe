import { encode } from "blurhash";
import { getPosterForVideo } from "./util";

const loadImage = async (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (...args) => reject(args);
    img.src = src;
  });
  
const getImageData = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get 2d context from canvas");
  }
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

export const encodeImageToBlurhash = async (imageUrl: string) => {
  const image = await loadImage(imageUrl);
  const imageData = getImageData(image);
  return encode(imageData.data, imageData.width, imageData.height, 4, 4);
};

export const generateBlurHash = async (item: File, cloudinaryURL: string) => {
  let blob: Blob = item;
  if (!(item.type.includes("image") || item.type.includes("video"))) {
    return;
  }
  if (item.type.includes("video")) {
    blob = await getThumbnailOfVideo(cloudinaryURL);
  } 
  const url = URL.createObjectURL(blob);
  const blurhash = await encodeImageToBlurhash(url);
  URL.revokeObjectURL(url);
  return blurhash;
};

export const getThumbnailOfVideo = async (videoUrl: string) => {
  const imgUrl = getPosterForVideo(videoUrl);
  
  const data = await fetch(imgUrl);
  
  const blob = await data.blob();
  
  return blob;
};
