import {
  ChangeDetectorRef,
  Component,
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


interface Message {

  role:
    | 'user'
    | 'assistant';

  content: string;

  sources?: ChatSource[];

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

  private readonly chatService =
    inject(ChatService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  message = '';

  loading = false;

  messages: Message[] = [];


  async send(): Promise<void> {

    const question =
      this.message.trim();


    if (
      !question ||
      this.loading
    ) {
      return;
    }


    console.log(
      'USER QUESTION:',
      question
    );


    // Add user message
    this.messages = [
      ...this.messages,
      {
        role: 'user',
        content: question
      }
    ];


    // Clear input
    this.message = '';


    // Create assistant message
    const assistantMessage: Message = {
      role: 'assistant',
      content: ''
    };


    this.messages = [
      ...this.messages,
      assistantMessage
    ];


    this.loading = true;


    // Immediately update UI
    this.cdr.detectChanges();


    try {

      await this.chatService.streamChat(

        question,


        // =========================
        // TOKEN
        // =========================
        (token: string) => {

          console.log(
            'TOKEN FOR UI:',
            token
          );


          assistantMessage.content +=
            token;


          console.log(
            'CURRENT CONTENT:',
            assistantMessage.content
          );


          // Update array
          this.messages = [
            ...this.messages
          ];


          // FORCE ANGULAR UI UPDATE
          this.cdr.detectChanges();

        },


        // =========================
        // SOURCES
        // =========================
        (sources: ChatSource[]) => {

          console.log(
            'SOURCES FOR UI:',
            sources
          );


          assistantMessage.sources =
            sources;


          this.messages = [
            ...this.messages
          ];


          // FORCE ANGULAR UI UPDATE
          this.cdr.detectChanges();

        }

      );

    } catch (error) {

      console.error(
        'CHAT ERROR:',
        error
      );


      assistantMessage.content =
        'Sorry, something went wrong while processing your request.';


      this.messages = [
        ...this.messages
      ];


      this.cdr.detectChanges();

    } finally {

      this.loading = false;


      this.messages = [
        ...this.messages
      ];


      this.cdr.detectChanges();

    }

  }


  handleEnter(
    event: Event
  ): void {

    const keyboardEvent =
      event as KeyboardEvent;


    // Shift + Enter = new line
    if (
      keyboardEvent.shiftKey
    ) {
      return;
    }


    event.preventDefault();


    void this.send();

  }

}