const IS_PROD = process.env.NODE_ENV === "production";

const server = {
    baseUrl: IS_PROD
        ? "https://we-meet-backend.onrender.com"  // Live/Production URL
        : "http://localhost:8000"                 // Localhost URL
};

export default server;
