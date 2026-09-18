import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"8 этаж — интерактивный digital twin",description:"Интерактивный архитектурный план, 3D-обзор и прогулка по восьмому этажу",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
