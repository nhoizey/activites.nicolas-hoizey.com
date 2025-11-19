// https://stackoverflow.com/a/79511230/717195
export const removeEmojis = (str) => {
  if (!str) return str;

  return str.replace(/(?!(\*|#|\d))[\p{Extended_Pictographic}\p{Emoji_Component}]|[\u0030-\u0039]\ufe0f?[\u20e3]|[\u002A\u0023]?\ufe0f?[\u20e3]/gu, '');
}

export const activityEmoji = (type) => {
  switch (type) {
    case 'ski alpin': return '⛷️';
    case 'randonnée': return '🥾';
    case 'marche': return '🚶‍♂️';
    case 'vélo': return '🚴‍♂️';
    case 'gravel': return '🚵';
    case 'vtt': return '🚵';
    case 'course': return '🏃‍♂️';
    case 'natation': return '🏊‍♂️';
    case 'escalade': return '🧗‍♂️';
    case 'tennis': return '🎾';
    case 'fit tennis': return '🏋️‍♀️';
    case 'padel': return '🎾';
    case 'pickleball': return '🎾';
    case 'badminton': return '🏸';
    case 'ping pong': return '🏓';
    case 'golf': return '🏌️‍♂️';
    case 'entraînement': return '🏋️‍♀️';
    case 'voile': return '⛵️';
    default: return `[${type}]`;
  }
}

export const cleanImageUrlsInRecits = (content, siteUrl) => {
  return content.replace(/<img src="\/collections\/activites\//g, `<img width="600" src="${siteUrl}activites/`);
}