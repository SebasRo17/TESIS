export class TopicNotFoundError extends Error {
  constructor(message: string = 'Topic not found') {
    super(message);
    this.name = 'TopicNotFoundError';
  }
}
