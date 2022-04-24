export interface MediaSettingsStore {
  [endpointId: string]: {
    [mid: string]: {
      active: boolean;
      kind: string;
      width?: number;
      height?: number;
    };
  };
}
