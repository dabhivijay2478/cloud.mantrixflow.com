import { getIconComponent } from "./connector-icon";

export { getIconComponent };

export const getConnectionFields = (dataSourceType: string) => {
  const oauthSources = ["google-sheets", "salesforce", "hubspot"];
  const fileSources = ["excel", "csv"];

  if (oauthSources.includes(dataSourceType)) {
    return "oauth";
  }
  if (fileSources.includes(dataSourceType)) {
    return "file";
  }
  return "form";
};
