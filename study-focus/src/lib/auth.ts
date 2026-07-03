export const TOKEN_KEY = "@StudyFocus:token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

// export const isAuthenticated = () => Boolean(getToken());

// export const logout = () => {
//   localStorage.removeItem(TOKEN_KEY);
//   window.location.href = "/login";
// };
