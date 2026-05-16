import Keycloak from "keycloak-js";

const KEYCLOAK_BASE_URL = import.meta.env.VITE_KEYCLOAK_BASE_URL;

const keycloakConfig = {
  url: KEYCLOAK_BASE_URL,
  realm: "Tea4Life",
  clientId: "tea4life-spa-main",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
