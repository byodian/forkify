export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);

    // 同步 localStorage 数据
    this.persitData();

    return like;
  }

  deleteLike(id) {
    const index = this.likes.findIndex(el => el.id === id);

    this.likes.splice(index, 1);

    // 同步 localStorage 数据
    this.persitData();
  }

  isLiked(id) {
    return this.likes.findIndex(el => el.id === id) !== -1;
  } 

  getNumLikes() {
    return this.likes.length;
  }

  persitData() {
    localStorage.setItem('likes', JSON.stringify(this.likes));
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem('likes'));

    // 重新存储数据到 localStorage
    if (storage) this.likes = storage;
  }
}
