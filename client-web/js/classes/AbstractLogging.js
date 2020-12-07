

export class AbstractLogging{

  constructor(ID) {
    this.ID = ID;
  }

  logging(...arg){
    console.log(...[`${this.ID}::`,...arg]);
  }

  error(...arg){
    console.error(...[`${this.ID}::`,...arg]);
  }

  warn(...arg){
    console.warn(...[`${this.ID}::`,...arg]);
  }

}
