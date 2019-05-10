class Champion {
  constructor(champion) {
    this.id = champion.id
    this.name = champion.name
    this.image = champion.image
    Champion.all.push(this)
  }

  static getChampionUrl() {
    return 'http://localhost:3000/champions'
  }

  static fetchChampion() {
    fetch(Champion.getChampionUrl())
      .then(res => res.json())
      .then(champions => champions.forEach(champion => {
        new Champion(champion)
      }))
  }
}

Champion.all = []