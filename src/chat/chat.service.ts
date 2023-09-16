import { Inject, Injectable } from '@nestjs/common';
import { Message } from 'src/message/message.entity';
import { MessageService } from 'src/message/message.service';
import { OpenAI } from 'openai';

type ResponseMessage = {
  response: Message;
  error: string;
};

const INSTRUCTION =
  'You are a professional Agile coach, responsible for generating user stories and seeking advice based on Agile. If the task is to generate a user story, strictly only follow this pattern: ‘As a <User>, I want <action> so that <reason>’ . Be concise and short, do not use technical terms. For questions related to Agile scope, be short and show enthusiasm. For tasks that are not related to Agile(approach to project management and software development , Kanban, Scrum etc.) or generating stories always give one answer “I’am AI Coach, but your question is not related to my work scope”.This is context of your previous conversation, your advice or story have not to conflict with it: ';

@Injectable()
export class ChatService {
  private openai: OpenAI = new OpenAI({
    apiKey: process.env.CHAT_GPT_API_KEY,
    organization: process.env.ORGANIZATION_ID,
  });
  private prompt: string;

  @Inject(MessageService)
  private readonly messageService: MessageService;

  public async sendRequest(
    message: Message,
  ): Promise<Partial<ResponseMessage>> {
    let response = null;
    let error = null;
    try {
      await this.generatePrompt();
      await this.messageService.saveMessage(message);
      response = await this.generateResponse(message.message);
      await this.messageService.saveMessage(response);
    } catch (e) {
      error =
        'Looks like we have problem, Try to reconnect, or come back later.';
    }

    return { response: response, error };
  }

  public getHistory(): Promise<Message[]> {
    return this.messageService.getHistory();
  }

  private async generateResponse(message_body: string) {
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'assistant', content: this.prompt + message_body }],
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
    });
    const response = {
      msg_type: 'response',
      message: completion.choices[0].message.content,
    } as Message;
    return response;
  }

  private async generatePrompt() {
    const history = await this.messageService.getHistory();
    const context = history.reduce((acc, cur) => {
      return (acc +=
        cur.msg_type === 'response'
          ? `You answered: ${cur.message}`
          : `User asked: ${cur.message}`);
    }, '');
    this.prompt = INSTRUCTION + context;
  }
}
