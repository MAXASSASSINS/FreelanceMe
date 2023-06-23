import axios from "axios";
import { generateBlurHash } from "./blurHash";

const cloudName = "dyod45bn8";
const unsignedUploadPreset = "syxrot1t";

export const uploadToCloudinary = async (arr) => {
  const urls = [];

  for (const item of arr) {
    if (!item.type) {
      urls.push(item);
      continue;
    }
    const formData = new FormData();
    formData.append("file", item);
    formData.append("upload_preset", unsignedUploadPreset);
    formData.append("cloud_name", cloudName);
    const data = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      formData,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
    // console.log(data);
    const obj = {};
    if (item.type.includes("video")) {
      obj.videoPublicId = data.data.public_id;
      obj.videoUrl = data.data.secure_url;
      obj.videoName = data.data.original_filename;
      obj.mimeType = data.data.format;
    } else if (item.type.includes("image")) {
      obj.imgPublicId = data.data.public_id;
      obj.imgUrl = data.data.secure_url;
      obj.imgName = data.data.original_filename;
    } else {
      obj.public_id = data.data.public_id;
      obj.url = data.data.secure_url;
      obj.name = data.data.original_filename;
    }

    urls.push(obj);
  }
  return urls;
};

const uploadToCloudinarySingle = async (item, maxSize) => {
  const formData = new FormData();
  formData.append("file", item);
  formData.append("upload_preset", unsignedUploadPreset);
  formData.append("cloud_name", cloudName);

  if (maxSize && item.size > maxSize) {
    return Promise.reject("Max file size allowed is 5GB.");
  }

  console.log(item);

  try {
    const data = await processFile(item);
    console.log(data);

    // creating blur hash
    const blurhash = await generateBlurHash(item, data.data.secure_url);
    console.log(blurhash);
    // const url = URL.createObjectURL(item);
    // console.log(url);
    // const blurhash = await encodeImageToBlurhash(url);
    // console.log(blurhash);

    console.log(data);
    const obj = {
      publicId: data.data.public_id,
      url: data.data.secure_url,
      name: item.name,
      type:
        data.data.resource_type.toString() + "/" + data.data.format.toString(),
      size: data.data.bytes,
      blurhash: blurhash,
      height: data.data.height,
      width: data.data.width,
    };

    return obj;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const uploadToCloudinaryV2 = async (arr, maxSize) => {


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

let XUniqueUploadId = +new Date();

let POST_URL =
  "https://api.cloudinary.com/v1_1/" + "dyod45bn8" + "/auto/upload";

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const processFile = async (file) => {
  let size = file.size;
  let sliceSize = 6000000;
  let start = 0;
  let numberOfSlices = Math.ceil(size / sliceSize);

  let data;

  for (let i = 0; i < numberOfSlices; i++) {
    try {
      let end = start + sliceSize;
      if (end > size) {
        end = size;
      }
      let s = file.slice(start, end);
      await delay(3);
      data = await send(s, start, end - 1, size);
      start += sliceSize;
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }
  return data;
};

const send = async (piece, start, end, size) => {
  console.log("start ", start);
  console.log("end", end);

  const formData = new FormData();
  console.log(XUniqueUploadId);

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
    console.log(res.data);
    return res;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

