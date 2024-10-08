"use client";

import { useActionState, useEffect } from "react";

import { updateUser } from "@/lib/actions/users";
import { AccountCard, AccountCardBody, AccountCardFooter } from "./AccountCard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UpdateEmailCard({ email }: { email: string }) {
	const [state, formAction, pending] = useActionState(updateUser, {
		error: "",
	});

	useEffect(() => {
		if (state.success === true) toast.success("Updated Email");
		if (state.error) toast.error("Error", { description: state.error });
	}, [state]);

	return (
		<AccountCard
			params={{
				header: "Your Email",
				description:
					"Please enter the email address you want to use with your account.",
			}}
		>
			<form action={formAction}>
				<AccountCardBody>
					<Input defaultValue={email ?? ""} name="email" />
				</AccountCardBody>
				<AccountCardFooter description="We will email vou to verify the change.">
					<Button disabled={pending}>Update Email</Button>;
				</AccountCardFooter>
			</form>
		</AccountCard>
	);
}
