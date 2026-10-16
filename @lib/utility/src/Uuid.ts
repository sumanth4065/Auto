import { v4 as uuidv4 } from 'uuid'

export class Uuid {
  static getId() {
    return uuidv4();
  }
}