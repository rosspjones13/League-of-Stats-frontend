class User {
  constructor(user) {
    this.id = user.id
    this.name = user.name
    this.matches = user.matches
    this.teams = user.teams
    this.champions = []
    User.all.push(this)
    this.matches.forEach(match => new Match(match))
    this.teams.forEach(team => new Team(team))
  }

  render() {
    let dispContainer = document.querySelector('.display-container')
    dispContainer.innerHTML = ''
    document.querySelector('#user-name').innerText = this.name

    let lineChart = document.createElement('canvas')
    lineChart.id = "myChart"

    dispContainer.append(lineChart)

    let sorted = this.champions.sort(function (a, b) {
      return a.played - b.played
    })

    let dataObj = {
      labels: [],
      datasets: [{
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
        data: []
      }]
    }
    for(let i = 0; i < 5; i++) {
      dataObj.labels.push(sorted[i].champion.name)
      dataObj.datasets[0].data.push(sorted[i].kills)
    }
    var ctx = document.querySelector('#myChart').getContext('2d');
    
    var myLineChart = new Chart(ctx, {
      type: 'bar',
      data: dataObj,
      options: {
        legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Most Played Champions Average Kills'
          },
          aspectRatio: 1.5
      }
    })
  }

  renderMatches(){
    let dispContainer = document.querySelector(".display-container")
    dispContainer.innerHTML = ''

    let addMatchBtn = document.createElement('button')
    addMatchBtn.id = 'add-match-button'
    addMatchBtn.classList = 'btn btn-outline-dark mb-2'
    addMatchBtn.innerText = 'Add New Match'
    addMatchBtn.addEventListener('click', () => {
      addMatchBtn.remove()
      Match.renderMatchForm(this, addMatchBtn)
    })

    let matchTable = document.createElement('table')
    matchTable.classList = "table table-hover"
    matchTable.innerHTML = `
    <thead class="thead-dark">
    <tr>
    <th scope="col">Played</th>
    <th scope="col">Champion</th>
    <th scope="col">Kills</th>
    <th scope="col">Deaths</th>
    <th scope="col">Assists</th>
    <th scope="col">Win/Loss</th>
    <th scope="col" class="text-center kda"><span class="red">K</span> / <span class="black">D</span> / <span class="blue">A</span> Chart</th>
    </tr>
    </thead>
    `

    let sorted = this.matches.sort(function (a, b) {
      return new Date(a.created_at) - new Date(b.created_at)
    })

    let tableBody = document.createElement('tbody')
    let dataArr = []
    let counter = 0
    sorted.forEach(userMatch => {
      let foundMatch = Match.all.find(match => match.id === userMatch.id)
      tableBody.prepend(foundMatch.render(++counter))
      dataArr.push({
        datasets: [{
          data: [foundMatch.kills, foundMatch.deaths, foundMatch.assists],
          backgroundColor: ['red', 'black', 'blue']
        }],
        labels: ['Kills', 'Deaths', 'Assists']
      })
    })
    let newCounter = 0
    matchTable.appendChild(tableBody)
    dispContainer.append(addMatchBtn, matchTable)
    dataArr.forEach(data => {
      var ctx = document.querySelector(`#myChart-${++newCounter}`).getContext('2d');
      var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          aspectRatio: 3,
          legend: {
            display: false
          }
        }
      });
    })
  }

  renderChampions(){
    let dispContainer = document.querySelector(".display-container")
    dispContainer.innerHTML = ''
    let championTable = document.createElement('table')
    championTable.classList = "table table-hover"
    championTable.innerHTML = `
    <thead class="thead-dark">
    <tr>
    <th scope="col">Name</th>
    <th scope="col">Kills</th>
    <th scope="col">Deaths</th>
    <th scope="col">Assists</th>
    <th scope="col">Win %</th>
    <th scope="col">Played</th>
    <th scope="col" class="text-center"><span class="red">K</span> / <span class="black">D</span> / <span class="blue">A</span> Average</th>
    </tr>
    </thead>
    `
    let sorted = this.champions.sort(function (a, b) {
      var nameA = a.champion.name.toUpperCase(); // ignore upper and lowercase
      var nameB = b.champion.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    })

    let tableBody = document.createElement('tbody')
    let dataArr = []
    let counter = 0
    sorted.forEach(champion => {
      let championRow = document.createElement('tr')
      championRow.innerHTML = `
      <th class="align-middle" scope="row"><img src="${champion.champion.image}" alt=""> ${champion.champion.name}</th>
      <td class="align-middle">${champion.kills.toFixed(2)}</td>
      <td class="align-middle">${champion.deaths.toFixed(2)}</td>
      <td class="align-middle">${champion.assists.toFixed(2)}</td>
      <td class="align-middle">${(champion.result * 100).toFixed(2)}%</td>
      <td class="align-middle">${champion.played}</td>
      <td class="align-left"><canvas id="myChart-${++counter}"></canvas></td>
      `
      dataArr.push({
        datasets: [{
          data: [champion.kills, champion.deaths, champion.assists],
          backgroundColor: ['red', 'black', 'blue']
        }],
        labels: ['Kills', 'Deaths', 'Assists']
      })
      tableBody.appendChild(championRow)
    })
    championTable.appendChild(tableBody)
    dispContainer.appendChild(championTable)
    let newCounter = 0
    dataArr.forEach(data => {
      var ctx = document.querySelector(`#myChart-${++newCounter}`).getContext('2d');
      var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          aspectRatio: 3,
          legend: {display: false}
        }
      });
    })
  }

  static createUserForm(userName) {
    let dispContainer = document.querySelector('.display-container')
    dispContainer.innerHTML = ''
    document.querySelector('#user-name').innerText = ''

    let noUser = document.createElement('h5')
    noUser.classList = 'no-user-alert'
    noUser.innerText = `There is no user with the display name ${userName}. Check capitilization, it counts!`

    let newUserDiv = document.createElement('div')

    let newUser = document.createElement('h3')
    newUser.innerText = 'Create new user?'

    let newBtn = document.createElement('button')
    newBtn.classList = 'btn btn-outline-dark my-2 my-sm-0'
    newBtn.id = 'new-user'
    newBtn.innerText = 'New User'
    newBtn.addEventListener('click', () => {
      newBtn.remove()
      newUserDiv.append(newUser)
      User.getUserNameForm(newUserDiv)
    })

    newUserDiv.append(newUser, newBtn)
    dispContainer.append(noUser, newUserDiv)
  }

  static getUserNameForm(newUserDiv) {
    let createBtn = document.createElement('button')
    createBtn.innerText = 'Create User'
    createBtn.classList = 'btn btn-outline-dark my-2 my-sm-0'
    createBtn.addEventListener('click', () => {
      User.addNewUser(document.querySelector('#new-user-name').value)
    })
    newUserDiv.append(User.showNewForm(), createBtn)
  }

  static showNewForm() {
    let newUserInput = document.createElement('form')
    newUserInput.innerHTML = `
    <div class="form-group">
      <input class="form-control" id="new-user-name" placeholder="Enter Username">
      <small class="form-text text-muted">Remember, capitilization matters when picking a username.</small>
    </div>`
    return newUserInput
  }

  static addNewUser(newUserName) {
    fetch(getUserUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({name: newUserName})
    })
    .then(res => res.json())
    .then(user => {
      let userInstance = new User(user)
      userInstance.render()
    })
  }

  renderTeams(){
    let dispContainer = document.querySelector(".display-container")
    dispContainer.innerHTML = ''
    let teamTable = document.createElement('table')
    teamTable.className = 'table table-hover'
    teamTable.innerHTML = `
    <thead class="thead-dark">
    <tr>
    <th scope="col">Name</th>
    <th scope="col">Top</th>
    <th>Jungle</th>
    <th>Midlane</th>
    <th>AD Carry</th>
    <th>Support</th>
    </tr>
    </thead>
    `
    let tableBody = document.createElement('tbody')
    this.teams.forEach(team => {
      let teamRow = document.createElement('tr')
      let teamNameHeader = document.createElement('th')
      teamNameHeader.innerText = `${team.name}`
      teamRow.append(teamNameHeader)
      team.users.forEach(user => {
        let teamPlayersRow = document.createElement('td')
        teamPlayersRow.innerText = `${user.name}`
        teamRow.append(teamPlayersRow)
      })
      tableBody.append(teamRow)
    })
    teamTable.append(tableBody)
    dispContainer.append(teamTable)
  }
}

User.all = []
