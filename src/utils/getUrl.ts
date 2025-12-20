const urlRegex =
  /^(?:(https?|ftp):\/\/)?((localhost|(\d{1,3}\.){3}\d{1,3})|([a-z0-9-]+\.)+[a-z]{2,})(:\d{2,5})?(\/[^\s]*)?$/i;

export const getUrl = (str: string) => {
  if (!urlRegex.test(str)) {
    return null;
  }

  if (/^https?:\/\//i.test(str)) {
    return str;
  }

  return `https://${str}`;
};
