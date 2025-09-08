
export interface CountdownState {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isBirthday: boolean;
}

export interface ThreeSceneHandle {
  triggerFireworks: () => void;
  toggleTilt: () => Promise<boolean>;
  playChime: () => void;
  toggleFullscreen: () => void;
}
