import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shivam Duplex Society Portal",
  description: "Shivam Duplex residents and committee portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
