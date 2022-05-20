import PdfPrinter from "pdfmake";
import axios from "axios";
import striptags from "striptags";

export const getPDFReadableStream = async (media) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  let imagePart = {};
  let commentPart = [];
  console.log("COMMENTPART:", commentPart);
  if (media.Poster /* && media.reviews.length !== 0 */) {
    media.reviews.forEach((r) => {
      commentPart.push(r.comment.toString());
      console.log("COMMENTPART 2:", commentPart);
    });

    const response = await axios.get(media.Poster, {
      responseType: "arraybuffer",
    });

    const imageCoverURLParts = media.Poster.split("/");
    const fileName = imageCoverURLParts[imageCoverURLParts.length - 1];
    const [imdbID, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }

  const docDefinition = {
    content: [
      imagePart,
      { text: media.Title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: striptags(media.Type), lineHeight: 2 },
      "THESE ARE THE COMMENTS FOR THIS MEDIAPOST:",
      commentPart,
    ],
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
