// https://stackoverflow.com/a/79511230/717195
export const removeEmojis = (str) => {
  if (!str) return str;

  return str.replace(/(?!(\*|#|\d))[\p{Extended_Pictographic}\p{Emoji_Component}]|[\u0030-\u0039]\ufe0f?[\u20e3]|[\u002A\u0023]?\ufe0f?[\u20e3]/gu, '');
}