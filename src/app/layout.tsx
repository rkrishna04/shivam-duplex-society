import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Shivam Duplex | Society Portal",description:"Resident services, committee directory, maintenance, notices and society operations.",applicationName:"Shivam Duplex",manifest:"/manifest.webmanifest"};
export const viewport:Viewport={themeColor:"#173b32",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
