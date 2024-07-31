export default {
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  tablesFilter: ["gcp_payments_*"],
};
