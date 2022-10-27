export default class Bag {
  constructor({ id, socket }) {
    this.id = id;
    this.socket = socket;

    this.paired = null;
  }

  pair(user) {
    this.paired = user;
  }
  
  unpair() {
    this.paired = null;
  }
}