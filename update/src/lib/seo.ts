export const SITE_NAME = "Play! South Wales";

interface PageMetaOptions {
	description?: string;
	noindex?: boolean;
}

export function pageMeta(
	title: string,
	{ description, noindex }: PageMetaOptions = {},
) {
	return {
		meta: [
			{ title: `${title} | ${SITE_NAME}` },
			...(description ? [{ name: "description", content: description }] : []),
			...(noindex ? [{ name: "robots", content: "noindex" }] : []),
		],
	};
}
