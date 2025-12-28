import AdmZip from "adm-zip";

// Export a world folder to .PeX (zip)
export function exportPex(worldFolderPath, outputFilePath) {
  const zip = new AdmZip();
  zip.addLocalFolder(worldFolderPath);
  zip.writeZip(outputFilePath);
}

// Import .PeX (zip) and return list of files + metadata
export function importPex(pexFilePath) {
  const zip = new AdmZip(pexFilePath);
  zip.extractAllTo(/*target path*/ "tempWorld", true);
  const worldJson = JSON.parse(
    zip.readAsText("world.json")
  );
  return worldJson;
}
