export const indymotion = (id) => {
  const fullUrl = `https://indymotion.fr/videos/embed/${id}?title=0&amp;warningTitle=0`;
  return `

<div class="indymotion"><iframe width="100%" height="100%" src="${fullUrl}" allow="fullscreen" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe></div>

`;
}
