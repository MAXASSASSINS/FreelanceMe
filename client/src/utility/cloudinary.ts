import axios from "axios";
import { generateBlurHash } from "./blurHash";
import { IFile } from "../types/file.types";

const cloudName = "dyod45bn8";
const unsignedUploadPreset = "syxrot1t";

const uploadToCloudinarySingle = async (
  item: File | IFile,
  maxSize?: number
) => {
  if ((item as IFile).url) {
    return item as IFile;
  }

  item = item as File;

  const formData = new FormData();
  formData.append("file", item);
  formData.append("upload_preset", unsignedUploadPreset);
  formData.append("cloud_name", cloudName);

  if (maxSize && item.size > maxSize) {
    return Promise.reject("Max file size allowed is 5GB.");
  }

  try {
    const data = await processFile(item);
    const blurhash = await generateBlurHash(item, data?.data.secure_url);

    const obj: IFile = {
      publicId: data?.data.public_id,
      url: data?.data.secure_url,
      name: item.name,
      type: item.type,
      size: data?.data.bytes,
      blurhash: blurhash,
      height: data?.data.height ? data.data.height : 0,
      width: data?.data.width ? data.data.width : 0,
    };

    return obj;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const uploadToCloudinaryV2 = async (
  arr: (File | IFile)[],
  maxSize?: number
) => {
  const requests = arr.map((item) => {
    return uploadToCloudinarySingle(item, maxSize);
  });

  try {
    const ans = await Promise.all(requests);
    return ans;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

let POST_URL =
  "https://api.cloudinary.com/v1_1/" + cloudName + "/auto/upload";

const processFile = async (file: File) => {
  let size = file.size;
  let sliceSize = 5 * 1024 * 1024;
  let start = 0;
  let numberOfSlices = Math.ceil(size / sliceSize);

  let data;

  let XUniqueUploadId = (Math.random() * 100000000 + Date.now()).toString();
  console.log("XUniqueUploadId", XUniqueUploadId);
  

  for (let i = 0; i < numberOfSlices; i++) {
    try {
      let end = start + sliceSize;
      if (end > size) {
        end = size;
      }
      let s = file.slice(start, end);
      data = await send(s, start, end - 1, size, XUniqueUploadId);
      console.log('data', data.data);
      start += sliceSize;
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }
  return data;
};

const send = async (piece: Blob, start: number, end: number, size: number, XUniqueUploadId: string) => {
  const formData = new FormData();

  formData.append("file", piece);
  formData.append("cloud_name", "dyod45bn8");
  formData.append("upload_preset", "syxrot1t");
  formData.append("folder", "FreelanceMe");

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "X-Unique-Upload-Id": XUniqueUploadId,
  };

  try {
    const res = await axios.post(POST_URL, formData, { headers });
    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};
