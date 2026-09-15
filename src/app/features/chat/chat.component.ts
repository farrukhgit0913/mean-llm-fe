import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  DecimalPipe
} from '@angular/common';

import {
  ChatService
} from '../../core/services/chat.service';

import {
  ChatSource
} from '../../core/models/chat.models';


interface PipelineStep {

  label: string;

  state:
    | 'pending'
    | 'active'
    | 'completed';

}


interface Message {

  role:
    | 'user'
    | 'assistant';

  content: string;

  sources?: ChatSource[];

  processing?: boolean;

  status?: string;

  pipeline?: PipelineStep[];

}


@Component({

  selector: 'app-chat',

  standalone: true,

  imports: [
    FormsModule,
    DecimalPipe
  ],

  templateUrl:
    './chat.component.html',

  styleUrl:
    './chat.component.css'

})
export class ChatComponent {


  /*
   * ============================================================
   * VIEW
   * ============================================================
   */

  @ViewChild('messagesContainer')
  private messagesContainer?:
    ElementRef<HTMLElement>;


  /*
   * ============================================================
   * SERVICES
   * ============================================================
   */

  private readonly chatService =
    inject(ChatService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  message = '';

  loading = false;

  messages: Message[] = [];


  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  async send(): Promise<void> {

    const question =
      this.message.trim();


    /*
     * ----------------------------------------------------------
     * Prevent empty / duplicate requests
     * ----------------------------------------------------------
     */

    if (
      !question ||
      this.loading
    ) {

      return;

    }


    /*
     * ----------------------------------------------------------
     * Add USER message
     * ----------------------------------------------------------
     */

    this.messages = [

      ...this.messages,

      {
        role: 'user',
        content: question
      }

    ];


    /*
     * ----------------------------------------------------------
     * RAG pipeline
     * ----------------------------------------------------------
     */

    const pipeline:
      PipelineStep[] = [

        {
          label:
            'Create query embedding',

          state:
            'pending'
        },

        {
          label:
            'Search MongoDB knowledge base',

          state:
            'pending'
        },

        {
          label:
            'Retrieve relevant context',

          state:
            'pending'
        },

        {
          label:
            'Send context to Llama 3.2',

          state:
            'pending'
        },

        {
          label:
            'Generate answer',

          state:
            'pending'
        }

      ];


    /*
     * ----------------------------------------------------------
     * Add ASSISTANT placeholder
     * ----------------------------------------------------------
     */

    const assistant:
      Message = {

        role:
          'assistant',

        content:
          '',

        processing:
          true,

        status:
          'Starting RAG pipeline...',

        pipeline

      };


    this.messages = [

      ...this.messages,

      assistant

    ];


    /*
     * ----------------------------------------------------------
     * Remember assistant position.
     * ----------------------------------------------------------
     */

    const assistantIndex =
      this.messages.length - 1;


    /*
     * Clear input
     */

    this.message = '';

    this.loading = true;


    /*
     * Render immediately.
     */

    this.cdr.detectChanges();

    this.scrollToBottom();


    try {

      await this.chatService.streamChat(

        question,


        /*
         * ======================================================
         * TOKEN CALLBACK
         * ======================================================
         */

        (token: string) => {

          console.log(
            'UI TOKEN:',
            JSON.stringify(token)
          );


          const current =
            this.messages[
              assistantIndex
            ];


          if (!current) {

            return;

          }


          const updated:
            Message = {

              ...current,

              content:
                current.content + token,

              processing:
                true

            };


          /*
           * Replace assistant message immutably.
           */

          this.messages = [

            ...this.messages.slice(
              0,
              assistantIndex
            ),

            updated,

            ...this.messages.slice(
              assistantIndex + 1
            )

          ];


          /*
           * Force Angular to render token.
           */

          this.cdr.detectChanges();


          /*
           * Keep latest token visible.
           */

          this.scrollToBottom();

        },


        /*
         * ======================================================
         * SOURCES CALLBACK
         * ======================================================
         */

        (sources: ChatSource[]) => {

          console.log(
            'UI SOURCES:',
            sources
          );


          const current =
            this.messages[
              assistantIndex
            ];


          if (!current) {

            return;

          }


          const updated:
            Message = {

              ...current,

              sources

            };


          this.messages = [

            ...this.messages.slice(
              0,
              assistantIndex
            ),

            updated,

            ...this.messages.slice(
              assistantIndex + 1
            )

          ];


          this.cdr.detectChanges();

          this.scrollToBottom();

        },


        /*
         * ======================================================
         * STATUS CALLBACK
         * ======================================================
         */

        (status: string) => {

          console.log(
            'UI STATUS:',
            status
          );


          const current =
            this.messages[
              assistantIndex
            ];


          if (!current) {

            return;

          }


          /*
           * Clone pipeline.
           */

          const updatedPipeline:
            PipelineStep[] =
              current.pipeline
                ? current.pipeline.map(
                    (
                      step
                    ): PipelineStep => ({
                      ...step
                    })
                  )
                : [];


          /*
           * Update pipeline state.
           */

          this.updatePipeline(
            updatedPipeline,
            status
          );


          /*
           * Update message.
           */

          const updated:
            Message = {

              ...current,

              status,

              pipeline:
                updatedPipeline

            };


          this.messages = [

            ...this.messages.slice(
              0,
              assistantIndex
            ),

            updated,

            ...this.messages.slice(
              assistantIndex + 1
            )

          ];


          this.cdr.detectChanges();

          this.scrollToBottom();

        }

      );


      /*
       * ======================================================
       * STREAM COMPLETED
       * ======================================================
       */

      const current =
        this.messages[
          assistantIndex
        ];


      if (current) {

        const completedPipeline:
          PipelineStep[] =
            current.pipeline
              ? current.pipeline.map(
                  (
                    step
                  ): PipelineStep => ({

                    ...step,

                    state:
                      'completed'

                  })
                )
              : [];


        const completed:
          Message = {

            ...current,

            processing:
              false,

            status:
              'Answer generated successfully',

            pipeline:
              completedPipeline

          };


        this.messages = [

          ...this.messages.slice(
            0,
            assistantIndex
          ),

          completed,

          ...this.messages.slice(
            assistantIndex + 1
          )

        ];

      }


      this.cdr.detectChanges();

      this.scrollToBottom();


    } catch (error) {

      console.error(
        'CHAT ERROR:',
        error
      );


      const current =
        this.messages[
          assistantIndex
        ];


      if (current) {

        const failedPipeline:
          PipelineStep[] =
            current.pipeline
              ? current.pipeline.map(
                  (
                    step
                  ): PipelineStep => ({

                    ...step,

                    state:
                      'pending'

                  })
                )
              : [];


        const failed:
          Message = {

            ...current,

            content:
              current.content ||
              'Sorry, something went wrong while processing your request.',

            processing:
              false,

            status:
              'Pipeline failed',

            pipeline:
              failedPipeline

          };


        this.messages = [

          ...this.messages.slice(
            0,
            assistantIndex
          ),

          failed,

          ...this.messages.slice(
            assistantIndex + 1
          )

        ];

      }


      this.cdr.detectChanges();

      this.scrollToBottom();

    } finally {

      this.loading = false;

      this.cdr.detectChanges();

      this.scrollToBottom();

    }

  }


  /*
   * ============================================================
   * AUTO SCROLL
   * ============================================================
   */

  private scrollToBottom(): void {

    requestAnimationFrame(() => {

      const element =
        this.messagesContainer?.nativeElement;


      if (!element) {

        return;

      }


      element.scrollTo({

        top:
          element.scrollHeight,

        behavior:
          'auto'

      });

    });

  }


  /*
   * ============================================================
   * UPDATE RAG PIPELINE
   * ============================================================
   */

  private updatePipeline(
    pipeline: PipelineStep[],
    status: string
  ): void {

    const text =
      status.toLowerCase();


    /*
     * ----------------------------------------------------------
     * Create embedding
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'creating query embedding'
      )
    ) {

      this.setActive(
        pipeline,
        0
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * Search MongoDB
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'searching knowledge base'
      )
    ) {

      this.completeThrough(
        pipeline,
        0
      );

      this.setActive(
        pipeline,
        1
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * Relevant documents found
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'found'
      ) &&
      text.includes(
        'relevant document'
      )
    ) {

      this.completeThrough(
        pipeline,
        1
      );

      this.setActive(
        pipeline,
        2
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * No relevant knowledge
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'no relevant knowledge'
      )
    ) {

      this.completeThrough(
        pipeline,
        1
      );

      this.setActive(
        pipeline,
        2
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * General knowledge
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'general knowledge'
      )
    ) {

      this.completeThrough(
        pipeline,
        2
      );

      this.setActive(
        pipeline,
        3
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * Context added
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'context added'
      )
    ) {

      this.completeThrough(
        pipeline,
        2
      );

      this.setActive(
        pipeline,
        3
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * Sending request to Llama
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'sending request'
      )
    ) {

      this.completeThrough(
        pipeline,
        2
      );

      this.setActive(
        pipeline,
        3
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * Generating answer
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'generating the answer'
      )
    ) {

      this.completeThrough(
        pipeline,
        3
      );

      this.setActive(
        pipeline,
        4
      );

      return;

    }


    /*
     * ----------------------------------------------------------
     * Completed
     * ----------------------------------------------------------
     */

    if (
      text.includes(
        'answer generated'
      )
    ) {

      pipeline.forEach(
        (
          step
        ): void => {

          step.state =
            'completed';

        }
      );

    }

  }


  /*
   * ============================================================
   * SET ACTIVE PIPELINE STEP
   * ============================================================
   */

  private setActive(
    pipeline: PipelineStep[],
    index: number
  ): void {

    pipeline.forEach(
      (
        step,
        i
      ): void => {

        if (
          i < index
        ) {

          step.state =
            'completed';

        }

        else if (
          i === index
        ) {

          step.state =
            'active';

        }

        else {

          step.state =
            'pending';

        }

      }
    );

  }


  /*
   * ============================================================
   * COMPLETE PIPELINE THROUGH STEP
   * ============================================================
   */

  private completeThrough(
    pipeline: PipelineStep[],
    index: number
  ): void {

    pipeline.forEach(
      (
        step,
        i
      ): void => {

        if (
          i <= index
        ) {

          step.state =
            'completed';

        }

      }
    );

  }


  /*
   * ============================================================
   * ENTER KEY
   * ============================================================
   */

  handleEnter(
    event: Event
  ): void {

    const keyboardEvent =
      event as KeyboardEvent;


    /*
     * Shift + Enter = new line
     */

    if (
      keyboardEvent.shiftKey
    ) {

      return;

    }


    /*
     * Enter = send
     */

    event.preventDefault();

    void this.send();

  }

}