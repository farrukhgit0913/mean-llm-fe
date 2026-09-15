import {
  Injectable
} from '@angular/core';

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

    onToken:
      (token: string) => void,

    onSources:
      (sources: ChatSource[]) => void,

    onStatus:
      (status: string) => void

  ): Promise<void> {


    const response =
      await fetch(

        `${this.apiUrl}/chat/stream`,

        {

          method: 'POST',

          headers: {

            'Content-Type':
              'application/json',

            'Accept':
              'text/event-stream'

          },

          body: JSON.stringify({

            message

          })

        }

      );


    console.log(
      'Chat response:',
      response.status,
      response.headers.get(
        'content-type'
      )
    );


    if (
      !response.ok
    ) {

      const errorText =
        await response.text();


      throw new Error(
        `Chat request failed: ` +
        `${response.status} ` +
        `${errorText}`
      );

    }


    if (
      !response.body
    ) {

      throw new Error(
        'Streaming is not supported by this browser.'
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
      } =
        await reader.read();


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
        events.pop() ??
        '';


      for (
        const event of events
      ) {

        this.processSseEvent(

          event,

          onToken,

          onSources,

          onStatus

        );

      }

    }


    /*
     * Process final event.
     */

    if (
      buffer.trim()
    ) {

      this.processSseEvent(

        buffer,

        onToken,

        onSources,

        onStatus

      );

    }


    console.log(
      'Chat stream finished.'
    );

  }


  private processSseEvent(

    event: string,

    onToken:
      (token: string) => void,

    onSources:
      (sources: ChatSource[]) => void,

    onStatus:
      (status: string) => void

  ): void {


    const lines =
      event.split('\n');


    const dataLine =
      lines.find(
        line =>
          line.startsWith(
            'data:'
          )
      );


    if (
      !dataLine
    ) {

      return;

    }


    const json =
      dataLine.replace(
        /^data:\s*/,
        ''
      );


    if (
      !json.trim()
    ) {

      return;

    }


    try {

      const data =
        JSON.parse(json);


      console.log(
        'SSE event:',
        data
      );


      switch (
        data.type
      ) {


        /*
         * STATUS
         */

        case 'status':

          console.log(
            'STATUS:',
            data.value
          );


          if (
            typeof data.value ===
            'string'
          ) {

            onStatus(
              data.value
            );

          }

          break;


        /*
         * TOKEN
         */

        case 'token':

          console.log(
            'TOKEN RECEIVED:',
            data.value
          );


          if (
            typeof data.value ===
            'string'
          ) {

            onToken(
              data.value
            );

          }

          break;


        /*
         * SOURCES
         */

        case 'sources':

          console.log(
            'SOURCES RECEIVED:',
            data.sources
          );


          onSources(

            Array.isArray(
              data.sources
            )
              ? data.sources
              : []

          );

          break;


        /*
         * DONE
         */

        case 'done':

          console.log(
            'STREAM DONE'
          );

          break;


        /*
         * ERROR
         */

        case 'error':

          throw new Error(
            data.value ??
            data.message ??
            'Chat failed'
          );


        default:

          console.warn(
            'Unknown SSE event:',
            data
          );

      }


    } catch (error) {

      console.error(
        'Failed to process SSE event:',
        json,
        error
      );


      throw error;

    }

  }

}