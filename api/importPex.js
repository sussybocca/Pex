import formidable from "formidable";
import { importPex } from "../pexUtils.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message });
      const pexFile = files.pexFile;
      const worldData = importPex(pexFile.filepath);
      res.status(200).json({ success: true, world: worldData });
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
