import formidable from "formidable";
import { exportPex } from "../pexUtils.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message });
      const folderPath = fields.worldFolderPath;
      const outputPath = `./${fields.worldName}.PeX`;
      exportPex(folderPath, outputPath);
      res.download(outputPath);
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
