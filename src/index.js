document.addEventListener('DOMContentLoaded',() =>{
  Champion.fetchChampion()
  document.querySelector('#show-user').addEventListener('click', () => {
    event.preventDefault()
    let searchUser = document.querySelector('#search-user')
    let userName = searchUser.value
    searchUser.value = ''
    fetchUserInfo(userName)
  })
})

// Returns if user is found in the User.js class
function currentUserFunc(userData) {
  return User.all.find(user => user.id === userData.id)
}
function currentTeam(teamData) {
  return Team.all.find(team => team.name === teamData.name)
}
// Returns User URL
function getUserUrl() {
  return 'http://localhost:3000/users/'
}

// Grab user from API
function fetchUserInfo(userName) {
  fetch(getUserUrl() + userName)
  .then(resp => resp.json())
  .then(userData => {
      let isUser = currentUserFunc(userData)
      if (!isUser) {
        isUser = new User(userData)
      }
      isUser.render()
      navButtons(userData)
      document.querySelector('.navbar-brand').addEventListener('click', () => isUser.render())
    })
    .catch(error => User.createUserForm(userName))
  }
//Creates Side Menude Buttons
function navButtons(user) {
  document.querySelector('#side-button1-match').addEventListener('click', ()=>{
    currentUserFunc(user).renderMatches()
  })
  document.querySelector('#side-button1-new-team').addEventListener('click', ()=>{
    teamFormCreate(currentUserFunc(user))
  })
  document.querySelector('#side-button1-champion').addEventListener('click', () => {
    currentUserFunc(user).renderChampions()
  })
  document.querySelector('#side-button1-team').addEventListener('click', () => {
    currentUserFunc(user).renderTeams()
  })
}

//creates a Team Form
function teamFormCreate(currentUser) {
  let teamForm = document.createElement('div')
  let displayContainer = document.querySelector('.display-container')
  displayContainer.innerHTML = ''
  teamForm.innerHTML += ` <div class="container">
  <h3>Create a New Team:</h3>
  <br>
  <form id='teamName'>
  <input class="form-control form-control-sm" id="team-name" type="text" placeholder="Team Name">
  <br>
  <input class="btn-sm btn-outline-dark my-2 my-sm-0" id='team-create-button' type="submit">
  </form>
</div>`
  displayContainer.appendChild(teamForm)
  let createTeamBttn = document.querySelector('#teamName').addEventListener('submit', () => {
    event.preventDefault()
    let teamName = document.querySelector('#team-name').value
    createTeam(teamName, currentUser)
  })
}

//Fetch call to Rails API to create a team
function createTeam(name, currentUser) {
fetch('http://localhost:3000/teams',{
      method:"POST",
    	headers: {"Content-Type": "application/json"},
    	body: JSON.stringify( {name: name,
      user_ids: [currentUser.id]})
})
.then(resp => resp.json())
.then(teamData => {
  let teamInstance = new Team (teamData)
  currentUser.teams.push(teamInstance)
  teamInstance.render()
  addTeamMateFuncEvent(teamData, currentUser)
})
}

function addTeamMateFuncEvent(teamData, currentUser) {
  document.querySelector('#button-mate').addEventListener('click', () =>{
    fetchUsers(teamData, currentUser)
  })
}

//Fetch call to create find a user
function fetchUsers(teamData, currentUser) {
  let userContainer = document.querySelector('.user_container')
  let teamMatesSelect = document.createElement('div')
  teamMatesSelect.id = 'teamMateForm'
  teamMatesSelect.innerHTML += `<div class="container">
  <br>
  <form id='teamMate'>
  <h3>Pick a Team Mate:</h3>
  <input class="form-control form-control-sm" id="myInput" type="text" placeholder="Search..">
  <br>
  <input class="btn-sm btn-outline-dark my-2 my-sm-0" type="submit">
  </form>
</div>`
  teamMatesSelect.style.display = 'block'
  userContainer.append(teamMatesSelect)
  findATeamMateEvent(teamData, currentUser, teamMatesSelect)
}

function findATeamMateEvent(teamData, currentUser, teamMatesSelect) {
  teamMatesSelect.addEventListener('submit', () =>{
  event.preventDefault()
  teamMatesSelect.style.display = 'none'
  let search = document.querySelector('#myInput').value
  document.querySelector('#teamMateForm').remove()
  fetch('http://localhost:3000/users')
  .then(resp => resp.json())
  .then(users => {
    const foundUser = users.find(user => user.name === search)
    if (!foundUser) {
        alert("User cannot be found!")
        return
    } else {
      // debugger
       updateTeam(foundUser, teamData, currentUser)
    }
  })
})
}

function updateTeam(foundUser, teamData, currentUser) {
  let teamInstance = currentTeam(teamData)
  teamInstance.users.push(foundUser)
  let userIDs = teamInstance.users.map(user => user.id)
  fetch(`http://localhost:3000/teams/${teamData.id}`,{
        method:"PATCH",
      	headers: {"Content-Type": "application/json"},
      	body: JSON.stringify( {name: teamData.name,
        user_ids: [...userIDs]})
  })
  .then(resp => resp.json())
  .then(updatedTeamData => {
    teamInstance.render()
    addTeamMateFuncEvent(teamData, currentUser)
  })
}
