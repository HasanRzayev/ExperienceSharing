let micRecorderPromise: Promise<any> | null = null;

export const ensureMicRecorder = async () => {
  if (!micRecorderPromise) {
    micRecorderPromise = (async () => {
      const lameModule: any = await import('lamejs');
      const lame = lameModule?.default ?? lameModule;
      const globalScope = globalThis as any;
      if (globalScope) {
        if (!globalScope.Lame) {
          globalScope.Lame = lame;
        }
        if (!globalScope.lamejs) {
          globalScope.lamejs = lame;
        }
      }
      const micModule: any = await import('mic-recorder-to-mp3');
      return micModule?.default ?? micModule;
    })();
  }
  return micRecorderPromise;
};


