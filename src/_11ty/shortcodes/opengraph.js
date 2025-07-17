import getShareImage from "@jlengstorf/get-share-image";

export const ogImage = (title) => {
	return title
		? getShareImage({
				imageWidth: 1200,
				imageHeight: 630,
				cloudName: "nho",
			imagePublicID: "resources/activites-opengraph-background",
			titleFont: "Lexend",
			textAreaWidth: 900,
			textLeftOffset: 200,
				titleBottomOffset: 330,
				titleFontSize: 50 + Math.max(0, 30 - title.length),
				title: title,
			})
		: "";
};
