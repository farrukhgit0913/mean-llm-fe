import { Injectable } from '@angular/core';

import {
  ChatSource
} from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiUrl =
    'http://localhost:3000/api';

  async streamChat(
    message: string,

    onToken: (
      token: string
    ) => void,

    onSources: (
      sources: ChatSource[]
    ) => void
  ): Promise<void> {

    const response =
      await fetch(
        `${this.apiUrl}/chat/stream`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            message
          })
        }
      );

    if (!response.ok) {
      throw new Error(
        'Chat request failed'
      );
    }

    if (!response.body) {
      throw new Error(
        'Streaming is not supported'
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = '';

    while (true) {

      const {
        done,
        value
      } = await reader.read();

      if (done) {
        break;
      }

      buffer +=
        decoder.decode(
          value,
          {
            stream: true
          }
        );

      const events =
        buffer.split('\n\n');

      buffer =
        events.pop() ?? '';

      for (
        const event of events
      ) {

        const line =
          event
            .split('\n')
            .find(
              line =>
                line.startsWith('data:')
            );

        if (!line) {
          continue;
        }

        const json =
          line.replace(
            /^data:\s*/,
            ''
          );

        const data =
          JSON.parse(json);

        switch (data.type) {

          case 'token':

            onToken(
              data.value
            );

            break;

          case 'sources':

            onSources(
              data.sources
            );

            break;

          case 'error':

            throw new Error(
              data.message
            );

          case 'done':

            break;
        }
      }
    }
  }
}
