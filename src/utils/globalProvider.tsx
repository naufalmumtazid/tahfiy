"use client";

import ToastProvider from "@/components/ToastProvider";

export default function GlobalProvider({children}: Readonly<{
  children: React.ReactNode;
}>) {
	return(
		<>
			<ToastProvider />
			{children}
		</>
	)
}