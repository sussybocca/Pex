import formidable from "formidable";
import { parseFBX } from "fbx-parser";

export const config = { api: { bodyParser: false } };

export default async function handler(req,res){
  if(req.method==="POST"){
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files)=>{
      if(err) return res.status(500).json({ success:false, error: err.message });
      try{
        const fbxFile = files.fbx.filepath;
        const parsed = parseFBX(fbxFile); // Node-side FS works
        res.status(200).json({ success:true, fbx: parsed });
      }catch(e){
        res.status(500).json({ success:false, error: e.message });
      }
    });
  } else res.status(405).send("Method Not Allowed");
}
