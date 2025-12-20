const imgCacheMap: Record<string, string> = {};

export const getBase64 = async (src: string) => {
  if (src in imgCacheMap) {
    return imgCacheMap[src];
  }

  const res = await fetch(src);
  const blob = await res.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onload = () => {
      const base64 = reader.result as string;
      imgCacheMap[src] = base64;
      resolve(base64);
    };
    reader.onerror = reject;
  });
};
