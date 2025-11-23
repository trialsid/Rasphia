export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.75
): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  const ratio = imageBitmap.width / imageBitmap.height;

  let targetWidth = imageBitmap.width;
  let targetHeight = imageBitmap.height;

  if (targetWidth > maxWidth) {
    targetWidth = maxWidth;
    targetHeight = maxWidth / ratio;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const compressedFile = new File(
          [blob!],
          file.name.replace(/\.\w+$/, ".jpg"),
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          }
        );
        resolve(compressedFile);
      },
      "image/jpeg",
      quality
    );
  });
}
