import { AbstractRunner } from './abstract.runner';

export class NpxRunner extends AbstractRunner {
  constructor() {
    super('npx');
  }
}
