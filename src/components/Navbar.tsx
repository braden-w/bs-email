"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { defaultLinks } from "@/config/nav";
import { AlignRight } from "lucide-react";
import { Logo } from "./Logo";

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	return (
		<div className="mb-4 w-full border-b pb-2 md:hidden">
			<nav className="flex w-full items-center justify-between">
				<Logo />
				<Button variant="ghost" onClick={() => setOpen(!open)}>
					<AlignRight />
				</Button>
			</nav>
			{open ? (
				<div className="my-4 bg-muted p-4">
					<ul className="space-y-2">
						{defaultLinks.map((link) => (
							<li key={link.title} onClick={() => setOpen(false)} className="">
								<Link
									href={link.href}
									className={
										pathname === link.href
											? "font-semibold text-primary hover:text-primary"
											: "text-muted-foreground hover:text-primary"
									}
								>
									{link.title}
								</Link>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}
