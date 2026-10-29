import "dotenv/config";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

async function main() {
  const publicUrl = process.env.PUBLIC_URL;
  if (!publicUrl) throw new Error("PUBLIC_URL is required");
  const parsedUrl = new URL(publicUrl);
  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
    throw new Error("PUBLIC_URL must use HTTPS outside localhost");
  }

  const svg = await QRCode.toString(publicUrl, { type: "svg", errorCorrectionLevel: "H", margin: 2, width: 1200 });
  await writeFile(path.join(process.cwd(), "menu-qr.svg"), svg, "utf8");
  await QRCode.toFile(path.join(process.cwd(), "menu-qr.png"), publicUrl, { type: "png", errorCorrectionLevel: "H", margin: 2, width: 1200 });
  console.log("QR codes written to menu-qr.svg and menu-qr.png");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "QR generation failed");
  process.exitCode = 1;
});