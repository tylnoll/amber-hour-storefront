import path from "node:path";

export function getDataDir() {
  const configured = process.env.DATA_DIR?.trim();

  if (configured) {
    return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
  }

  return path.join(process.cwd(), "data");
}
