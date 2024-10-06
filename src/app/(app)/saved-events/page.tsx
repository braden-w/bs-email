import SavedEventList from "@/components/savedEvents/SavedEventList";
import NewSavedEventModal from "@/components/savedEvents/SavedEventModal";
import { api } from "@/lib/trpc/api";

export default async function SavedEvents() {
	const { savedEvents } = await api.savedEvents.getSavedEvents.query();

	return (
		<main>
			<div className="flex justify-between">
				<h1 className="my-2 font-semibold text-2xl">Saved Events</h1>
				<NewSavedEventModal />
			</div>
			<SavedEventList savedEvents={savedEvents} />
		</main>
	);
}
