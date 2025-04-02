export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.endsWith("/")
  ? process.env.REACT_APP_BACKEND_URL
  : process.env.REACT_APP_BACKEND_URL + "/";

export const BACKEND_API_KEY = process.env.REACT_APP_BACKEND_API_KEY || "";

export const AMPLIFY_CONFIG_JSON = "__rp_codereview_app_amplify_config_json__";
