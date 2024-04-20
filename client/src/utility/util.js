export const getFileSize = (size) => {
  if (size < 1024) {
    return size + " B";
  } else if (size > 1024 && size < 1048576) {
    return (size / 1024).toFixed(2) + " KB";
  } else if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
};

export const downloadFile = (url, filename) => {
  const blobUrl = fetch(url)
    .then((r) => r.blob())
    .then((blobFile) => {
      const blobUrl = window.URL.createObjectURL(blobFile);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
    });
};

export const getPosterForVideo = (url) => {
  url = url.toString();
  const length = url.length;
  const index = url.lastIndexOf(".");

  let newUrl = url.slice(0, index);
  newUrl += ".jpg";
  return newUrl;
};

export const numberToCurrency = (number) => {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const setRedirectUrl = (url) => {
  localStorage.setItem('redirectUrl', url)
}

export const getRedirectUrl = () => {
  return localStorage.getItem('redirectUrl') ? localStorage.getItem('redirectUrl') : '/'
}

