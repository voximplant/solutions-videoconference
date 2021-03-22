export interface IChatMessage {
  id: string;
  payload: {
    connectionId?: string;
    time: string;
    displayName: string;
  };
  text: string;
  conversation?: string;
}
