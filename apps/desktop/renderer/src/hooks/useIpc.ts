import { useEffect, useState } from 'react';

export function useIpc() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if IPC is available
    if ((window as any).electron) {
      setIsReady(true);
    }
  }, []);

  const send = async (channel: string, data?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!(window as any).electron) {
        reject(new Error('IPC not available'));
        return;
      }
      
      (window as any).electron.send(channel, data)
        .then(resolve)
        .catch(reject);
    });
  };

  const subscribe = (channel: string, callback: (data: any) => void) => {
    if (!(window as any).electron) {
      return () => {};
    }
    
    const subscription = (window as any).electron.on(channel, callback);
    return () => subscription?.removeListener?.();
  };

  return {
    isReady,
    send,
    subscribe,
  };
}

export default useIpc;
