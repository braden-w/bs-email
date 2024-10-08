import Link from "next/link";

import SidebarItems from "./SidebarItems";
import { Avatar, AvatarFallback } from "./ui/avatar";

import { type AuthSession, getUserAuth } from "@/lib/auth/utils";

const Sidebar = async () => {
	const session = await getUserAuth();
	if (session.session === null) return null;

	return (
		<aside className="sticky hidden min-w-52 border-border border-r bg-muted p-4 pt-8 shadow-inner md:block">
			<div className="flex h-full flex-col justify-between">
				<div className="space-y-4">
					<SidebarItems />
				</div>
				<UserDetails session={session} />
			</div>
		</aside>
	);
};

export default Sidebar;

const UserDetails = ({ session }: { session: AuthSession }) => {
	if (session.session === null) return null;
	const { user } = session.session;

	if (!user?.name || user.name.length === 0) return null;

	return (
		<Link href="/account">
			<div className="flex w-full items-center justify-between border-border border-t px-2 pt-4">
				<div className="text-muted-foreground">
					<p className="text-xs">{user.name ?? "John Doe"}</p>
					<p className="pr-4 font-light text-xs">
						{user.email ?? "john@doe.com"}
					</p>
				</div>
				<Avatar className="h-10 w-10">
					<AvatarFallback className="border-2 border-border text-muted-foreground">
						{user.name
							? user.name
									?.split(" ")
									.map((word) => word[0].toUpperCase())
									.join("")
							: "~"}
					</AvatarFallback>
				</Avatar>
			</div>
		</Link>
	);
};
