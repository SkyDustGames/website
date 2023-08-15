const urlSearchParams = new URLSearchParams(window.location.search);
export default Object.fromEntries(urlSearchParams.entries());