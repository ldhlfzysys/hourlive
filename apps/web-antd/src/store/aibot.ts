import { useAppConfig } from '@vben/hooks';

import { defineStore } from 'pinia';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

enum AppKey {
  Scheduling = '57b6ed2fc6ff43dab506a128ff97adcd',
}

function _chat(
  query: string,
  app_key: AppKey,
  onData: (text: string) => void,
): Promise<void> {
  const url = `${apiURL}/ai/chat`;
  const params = {
    appid: app_key,
    prompt: query,
  };

  return fetch(url, {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => {
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const readStream = (): Promise<void> => {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const dataString = chunk.trim().replace(/^data:\s*/, ''); // Remove 'data: ' prefix

          try {
            const dataObject = JSON.parse(dataString);
            if (dataObject.text) {
              onData(dataObject.text); // Call the callback with the text field
            }
          } catch (error) {
            console.error('Failed to parse JSON:', error);
          }

          // Continue reading the next data chunk
          return readStream();
        });
      };

      return readStream();
    })
    .catch((error) => {
      console.error('Fetch failed:', error);
      throw error;
    });
}

export const useAIBotStore = defineStore('aibot', () => {
  function queryScheduling(query: string, onData: (chunk: string) => void) {
    return _chat(query, AppKey.Scheduling, onData);
  }

  return {
    queryScheduling,
  };
});
