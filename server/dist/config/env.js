import "dotenv/config";
function required(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing environment variable: ${name}`);
    return value;
}
export const env = {
    jwtSecret: required("JWT_SECRET"),
    accessTokenTtl: "15m",
    refreshTokenDays: 7,
};
//# sourceMappingURL=env.js.map