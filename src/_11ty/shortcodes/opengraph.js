import getShareImage from "@jlengstorf/get-share-image";

// biome-ignore lint/correctness/noUnusedImports: dotenv
import {} from "dotenv/config";

export const ogImage = (title) => {
	return title
		? getShareImage({
				imageWidth: 1200,
				imageHeight: 630,
				cloudName: process.env.CLOUDINARY_CLOUDNAME,
				imagePublicID: "resources/activites-opengraph-background",
				titleFont: "Roboto",
				textAreaWidth: 900,
				textLeftOffset: 200,
				titleBottomOffset: 330,
				titleFontSize: 50 + Math.max(0, 30 - title.length),
				title: title,
			})
		: "";
};
