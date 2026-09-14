export function getUkDateOnlyBoundary(dayOffset = 0): Date {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/London",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const values = Object.fromEntries(
		parts.map(({ type, value }) => [type, value]),
	);
	return new Date(
		Date.UTC(
			Number(values.year),
			Number(values.month) - 1,
			Number(values.day) + dayOffset,
		),
	);
}
