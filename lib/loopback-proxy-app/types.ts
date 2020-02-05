export class ApiVersionsResponse  {
  buildVersion: string;
  versions: ApiVersion[];
}

export type ApiVersion = {
  api: string;
  apiDetails: {
    name: string;
    version: string;
    description: string
  }
};
