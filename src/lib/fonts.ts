import { JetBrains_Mono, Rethink_Sans } from "next/font/google";

export const rethinkSans = Rethink_Sans({ subsets: ["latin"], variable: "--font-rethink" });

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});
