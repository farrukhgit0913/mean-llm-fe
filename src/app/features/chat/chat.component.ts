import {
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

    // Add user message
    this.messages.push({
      role: 'user',
      content: question
    });

    // Clear input
    this.message = '';

    // Create empty assistant message
    this.messages.push({
      role: 'assistant',
      content: ''
    });

    const assistant =
      this.messages[
        this.messages.length - 1
      ];

    this.loading = true;

    try {

      await this.chatService.streamChat(

        question,

        // Every streamed token
        token => {

          assistant.content += token;
        },

        // Sources returned after generation
        sources => {

          assistant.sources =
            sources;
        }
      );

    } catch (error) {

      console.error(
        'Chat error:',
        error
      );

      assistant.content =
        'Sorry, something went wrong.';

    } finally {

      this.loading = false;
    }
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.shiftKey) {
      return;
    }

    keyboardEvent.preventDefault();
    void this.send();
  }

}
