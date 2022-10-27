export default class User {
  constructor({ id, socket }) {
    this.id = id;
    this.socket = socket;

    this.paired = null;
  }

  pair(bag) {
    this.paired = bag;
  }
  
  unpair() {
    this.paired = null;
  }
}