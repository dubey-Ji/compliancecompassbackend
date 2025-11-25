import axios from "axios";
import crypto from "crypto";
import logger from "../utils/logger.js";
import config from "../config/config.js";
import { getRedisClient } from "../config/redis.js";
import Integration from "../models/Integration.js";
import IntegrationCatalog from "../models/IntegrationCatalog.js";
import { encrypt } from "../utils/encryption.js";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_BASE = "https://api.github.com";

export const generateGitHubAuthUrl = async (userId, organizationId) => {
  if (!userId || !organizationId) {
    throw new Error("User and organization ID required");
  }

  if (!config.github.clientId || !config.github.clientSecret) {
    throw new Error(
      "GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET"
    );
  }

  const catalogEntry = await IntegrationCatalog.findOne({
    where: { integration_key: "github" },
  });

  if (!catalogEntry) {
    throw new Error("GitHub integration not found in catalog");
  }

  const scopes = catalogEntry.required_scopes || ["read:org", "repo", "workflow"];
  const scopeString = scopes.join(" ");

  const state = crypto.randomBytes(32).toString("hex");
  const redisClient = getRedisClient();

  if (!redisClient) {
    throw new Error(
      "OAuth state storage unavailable. Redis required for OAuth flow."
    );
  }

  await redisClient.setEx(
    `github:oauth:state:${state}`,
    600,
    JSON.stringify({ userId, organizationId })
  );

  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: config.github.redirectUri,
    scope: scopeString,
    state: state,
  });

  const authUrl = `${GITHUB_AUTH_URL}?${params.toString()}`;

  return {
    integration_key: "github",
    auth_url: authUrl,
  };
};

export const handleGitHubCallback = async (code, state) => {
  if (!code || !state) {
    throw new Error("Missing code or state parameter");
  }

  const redisClient = getRedisClient();
  if (!redisClient) {
    throw new Error(
      "OAuth state storage unavailable. Redis required for OAuth flow."
    );
  }

  const stateKey = `github:oauth:state:${state}`;
  const stateData = await redisClient.get(stateKey);

  if (!stateData) {
    throw new Error("Invalid or expired OAuth state");
  }

  const { userId, organizationId } = JSON.parse(stateData);
  await redisClient.del(stateKey);

  // Exchange code for access token
  let tokenResponse;
  try {
    tokenResponse = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
  } catch (error) {
    logger.error("GitHub token exchange failed:", error.response?.data || error.message);
    throw new Error("Failed to exchange code for token");
  }

  const tokenData = tokenResponse.data;

  if (tokenData.error) {
    logger.error("GitHub token error:", tokenData);
    throw new Error(tokenData.error_description || "OAuth error");
  }

  const accessToken = tokenData.access_token;
  const tokenType = tokenData.token_type || "bearer";
  const scope = tokenData.scope || "";

  // Fetch GitHub user
  let githubUser;
  try {
    const userResponse = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    githubUser = userResponse.data;
  } catch (error) {
    logger.error("Failed to fetch GitHub user:", error.response?.data || error.message);
    throw new Error("Failed to fetch GitHub user information");
  }

  // Fetch GitHub organizations
  let selectedOrg = null;
  try {
    const orgsResponse = await axios.get(`${GITHUB_API_BASE}/user/orgs`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const orgs = orgsResponse.data;
    if (orgs.length > 0) {
      selectedOrg = orgs[0].login;
    }
  } catch (error) {
    logger.warn("Failed to fetch GitHub orgs:", error.response?.data || error.message);
    // Non-fatal, continue without org
  }

  const cred = {
    access_token: encrypt(accessToken),
    token_type: tokenType,
    scope: scope,
    github_user: githubUser.login,
    org: selectedOrg,
    repos: [],
  };

  const [integration, created] = await Integration.findOrCreate({
    where: {
      organization_id: organizationId,
      integration_key: "github",
    },
    defaults: {
      organization_id: organizationId,
      system_key: "github",
      integration_key: "github",
      integration_type: "oauth",
      cred: cred,
      status: "connected",
      last_synced_at: null,
    },
  });

  if (!created) {
    integration.cred = cred;
    integration.status = "connected";
    integration.last_synced_at = null;
    await integration.save();
  }

  return {
    success: true,
    integration_id: integration.id,
  };
};

