export interface MediaDeviceInfo {
  label: string;
  value: string;
  groupId: string;
  capabilities?: Record<string, unknown>;
}
