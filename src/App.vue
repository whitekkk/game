<template>
  <div v-show="wait">
    <div class="bgUpName"></div>
    <div v-show="checkName">
      <div v-if = "checkFull" class="popUpName">
        <h4 style="color: #EE0000; font-size: 2em;">
          Server is Full !!
        </h4>
      </div>
      <div v-else class="popUpName">
        <input v-model="myAvatar.name" type="text" placeholder="Guest">
        <button class="button play" @click="letPlay">play</button>
        <br>
        <br>
        <div class="chick" :style="{'background': color}" style="margin: 0 auto; display: inline-block;">
          <img :src="'../static/img/' + f + '.png'" width="100%"/>
        </div>
        &nbsp;
        <div style="margin: 0 auto; display: inline-block;">
          <button @click="selectFace(-1)" class="button play"><</button>
          Face : {{ f }}
          <button @click="selectFace(1)" class="button play">></button>
          <br>
          <button @click="selectColor(-1)" class="button play"><</button>
          Color : {{ c }}
          <button @click="selectColor(1)" class="button play">></button>
        </div>
        <h5 style="color: #CCCCCC; font-size: 2em;">
          <br><br>
          Score < 0 , Consumed , Nood is Die
        </h5>
      </div>
    </div>
    <div v-show="!checkName" class="popUpName">
      <h4 style="color: #00CC00; font-size: 2em;">
        Ready in {{waitingTime}}
      </h4>
    </div>
  </div>
  <div @mousemove="mousePosition()">
    <div class="screen" @mouseover="move(time)" @mouseout="outOfArea">

      <div class="avatar" :style="{'top': avatar.y-myAvatar.y+(halfHeight)-50 + 'px', 'left': avatar.x-myAvatar.x+halfWidth + 'px'}" v-for="avatar in avatars">
        <img v-if="myAvatar.id === avatar.id" src="../static/img/gird-bg.png" :style="{'position':'absolute', 'top': -avatar.y + 'px', 'left': -avatar.x + 'px'}"/>
        <div style="text-align: center; z-index: 100; position: absolute;">
          <a style="font-family: Lucida Console; font-weight: bolder; color: #00CC00; font-size: 1.5em;">
            {{avatar.name}}
          </a>
          <br>
          <div class="chick" :style="{'background': avatar.color}">
            <img :src="'../static/img/' + avatar.face + '.png'" width="100%"/>
          </div>
            <img :src="'../static/img/LEG' + avatar.leg2 + '.png'" width="10%"/>
        </div>
      </div>

      <div class="rankingBoard">
        <h4>&nbsp;&nbsp;
        Ranking <img src="../static/img/crown.png"/>
        </h4>
        <div class="ranking" v-for="avatar in avatars | orderBy 'score' -1">
          <h6 v-if="avatar.score !== undefined">
            <div style="display: inline-block;">
              {{' '}}
            </div>
            <div style="display: inline-block;">
              &nbsp;
              {{avatar.name + ' '}}
            </div>
            <div style="position: absolute; right:0; display: inline-block;">
              {{avatar.score}}
            </div>
          </h6>
        </div>
      </div>
      <div v-show="!wait">
        <h3 style="font-size: 2em; position: absolute; right:0; bottom: 0;">
          Score {{myAvatar.score}}
        </h3>
      </div>

      <div class="foods" :style="{'top': food.y-myAvatar.y+halfHeight + 'px', 'left': food.x-myAvatar.x+halfWidth + 'px'}" v-for="food in foods">
        <img :src="'../static/img/RICE'+ food.color +'.png'" style="position: absolute; z-index: 99;" width="100%"/>
      </div>

    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

var config = {
  apiKey: 'AIzaSyDI7TmN6g-aS8rIvzdWPu0KTtFe0_HW0A4',
  authDomain: 'todos-4ded8.firebaseapp.com',
  databaseURL: 'https://todos-4ded8.firebaseio.com',
  storageBucket: 'todos-4ded8.appspot.com',
  messagingSenderId: '245537528887'
}
firebase.initializeApp(config)

var Avatars = firebase.database().ref('avatars')
var myId = ''
window.onbeforeunload = function () {
  firebase.database().ref('avatars/' + myId).remove()
}

var Foods = firebase.database().ref('foods')

export default {
  created () {
    window.addEventListener('keyup', this.upKey)
    window.addEventListener('keydown', this.downKey)
  },
  ready () {
    let vm = this
    // vm.gameStart()
    var roomCheck = 0
    var key = 'value'
    Avatars.on(key, function (snapshot) {
      roomCheck = snapshot.numChildren()
      if (roomCheck >= 30) {
        vm.checkFull = true
      }
    })
    key = 'child_moved'
    let x = Math.floor(Math.random() * 2750) + 50
    let y = Math.floor(Math.random() * 2788) + 50
    let avatar = {
      x,
      y
    }
    let result = Avatars.push(avatar)
    myId = result.key
    // *warning
    Avatars.on('child_added', function (snapshot) {
      var item = snapshot.val()
      item.id = snapshot.key
      vm.avatars.push(item)
    })
    Avatars.on('child_changed', function (snapshot) {
      var id = snapshot.key
      var avatar = vm.avatars.find(avatar => avatar.id === id)
      avatar.x = snapshot.val().x
      avatar.y = snapshot.val().y
      avatar.face = snapshot.val().face
      avatar.speed = snapshot.val().speed
      avatar.eat = snapshot.val().eat
      avatar.score = snapshot.val().score
      // change
      if (vm.myAvatar.id === id) {
        vm.myAvatar.x = snapshot.val().x
        vm.myAvatar.y = snapshot.val().y
        vm.myAvatar.face = snapshot.val().face
        vm.myAvatar.speed = snapshot.val().speed
        vm.myAvatar.eat = snapshot.val().eat
        vm.myAvatar.score = snapshot.val().score
        if (vm.myAvatar.score === undefined) {
          vm.myAvatar.id = ''
        }
      }
    })
    Avatars.on('child_removed', function (snapshot) {
      var id = snapshot.key
      vm.avatars.$remove(vm.avatars.find(avatar => avatar.id === id))
      // vm.checkName = true ***`แก้ซะ`
      var checkDie = vm.avatars.find(avatar => avatar.id === myId)
      if (checkDie === undefined) {
        // vm.checkName = true // *****************
        vm.checkName = true
        vm.wait = true
        vm.waitingTime = 3
        clearInterval(vm.active)
      }
    })
    vm.foodsGen()
    Foods.on('child_added', function (snapshot) {
      var item = snapshot.val()
      item.id = snapshot.key
      vm.foods.push(item)
    })
    Foods.on('child_removed', function (snapshot) {
      var id = snapshot.key
      vm.foods.$remove(vm.foods.find(food => food.id === id))
    })
  },
  data () {
    let winHeight = window.innerHeight
    let winWidth = window.innerWidth
    let c = Math.floor(Math.random() * 3) + 1
    let f = Math.floor(Math.random() * 3) + 1
    let color = ''
    if (c === 1) {
      color = '#F5FF5D'
    } else if (c === 2) {
      color = '#AEFBE9'
    } else {
      color = '#FC665A'
    }

    return {
      checkFull: false,
      winHeight,
      winWidth,
      halfHeight: winHeight / 2,
      halfWidth: winWidth / 2,
      mouseX: 0,
      mouseY: 0,
      avatars: [],
      foods: [],
      time: 20,
      checkName: true,
      active: false,
      waitingTime: 3,
      wait: true,
      color,
      face: '',
      f,
      c: 1,
      myAvatar: {
        name: '',
        // color: `${chickColor}`, // color: `rgb(${r}, ${g}, ${b})`,
        x: 0,
        y: 0,
        face: '',
        color,
        speed: false,
        eat: false,
        king: false,
        score: 0
      }
    }
  },

  // computed property for form validation state
  computed: {
  },

  // methods
  methods: {
    selectFace (num) {
      this.f = this.f + num
      if (this.f > 3) {
        this.f = 1
      } else if (this.f <= 0) {
        this.f = 3
      }
    },
    selectColor (num) {
      this.c = this.c + num
      if (this.c > 3) {
        this.c = 1
      } else if (this.c <= 0) {
        this.c = 3
      }
      if (this.c === 1) {
        this.color = '#F5FF5D'
      } else if (this.c === 2) {
        this.color = '#AEFBE9'
      } else {
        this.color = '#FC665A'
      }
    },
    gameStart () {
      let vm = this
      setInterval(function () {
        vm.winHeight = window.innerHeight
        vm.winWidth = window.innerWidth
        vm.halfHeight = vm.winHeight / 2
        vm.halfWidth = vm.winWidth / 2
      }, 10)
      // *** ranks
      firebase.database().ref('avatars/' + myId).remove()
      vm.addAvatar(vm.myAvatar)
    },
    letPlay () {
      let vm = this
      vm.checkName = false
      let i = 0
      let waiting = setInterval(function () {
        vm.waitingTime--
        if (i === 2) {
          vm.gameStart()
          vm.wait = false
          clearInterval(waiting)
        }
        i++
      }, 1000)
    },
    upKey (e) {
      if (e.key === 'z') {
        this.normalSpeed()
      }
      if (e.key === 'x') {
        this.shutup()
      }
    },
    downKey (e) {
      if (e.keyCode === 17) {
      }
      if (e.key === 'z') {
        this.upSpeed()
      }
      if (e.key === 'x') {
        this.eat()
      }
    },
    addAvatar (newAvatar) {
      let vm = this
      let color = vm.color
      let face = vm.f
      vm.myAvatar.x = Math.floor(Math.random() * 2750) + 50
      vm.myAvatar.y = Math.floor(Math.random() * 2788) + 50
      vm.myAvatar.face = face
      vm.myAvatar.color = color
      vm.myAvatar.speed = false
      vm.myAvatar.eat = false
      vm.myAvatar.king = false
      vm.myAvatar.score = 0
      let result = Avatars.push(newAvatar)
      this.myAvatar.id = result.key
      myId = this.myAvatar.id
    },
    move (time) {
      // console.log(this.winHeight)
      let vm = this
      let xCenter = vm.winWidth / 2
      let yCenter = vm.winHeight / 2
      var xOrigin = vm.myAvatar.x
      var yOrigin = vm.myAvatar.y
      var x1 = vm.mouseX
      var y1 = vm.mouseY
      var dx = 0
      var dy = 0
      var checkX = 1
      var checkY = 1
      var err = 0
      let i = 1
      var e2 = 0

      vm.active = setInterval(function () {
        if (i === 10) {
          x1 = vm.mouseX
          y1 = vm.mouseY
          dx = Math.abs(x1 - xCenter)
          dy = Math.abs(y1 - yCenter)
          checkX = (xCenter < x1) ? 5 : -5
          checkY = (yCenter < y1) ? 5 : -5
          err = dx - dy
          e2 = 2 * err
          i = 0
        }
        i++
        if (vm.myAvatar.id !== myId) {
          vm.wait = true
        }
        if (!(((xCenter + 25 > x1) && (xCenter - 25 < x1)) && ((yCenter - 25 < y1) && (yCenter + 25 > y1)))) {
          if (vm.active && vm.myAvatar.id !== '') {
            firebase.database().ref('avatars/' + vm.myAvatar.id).update({
              y: yOrigin,
              x: xOrigin
            })
          }

          if (e2 > -dy) {
            err -= dy
            xOrigin += checkX
          }
          if (e2 < dx) {
            err += dx
            yOrigin += checkY
          }
          // check out of area
          if (yOrigin < -20 && y1 < yCenter) {
            yOrigin = -20
          }
          if (xOrigin < 0 && x1 < xCenter) {
            xOrigin = 0
          }
          if (yOrigin > 2845 && y1 > yCenter) {
            yOrigin = 2845
          }
          if (xOrigin > 2898 && x1 > xCenter) {
            xOrigin = 2898
          }
        }
      }, time)
    },
    checkEat () {
      var vm = this
      var eatFood = 0
      var index = 0
      var check = 0
      eatFood = vm.foods.find(food => {
        index++
        check = ((food.x < vm.myAvatar.x + 25) && (food.x > vm.myAvatar.x - 25)) && ((food.y < vm.myAvatar.y + 25) && (food.y > vm.myAvatar.y - 25))
        return (check)
      })
      vm.foods.splice(index, 1)
      if (eatFood !== undefined) {
        firebase.database().ref('foods/' + eatFood.id).remove()
        vm.myAvatar.score -= 20
        firebase.database().ref('avatars/' + vm.myAvatar.id).update({
          score: vm.myAvatar.score
        })
      }
      var eatChick = 0
      index = 0
      check = 0
      eatChick = vm.avatars.find(avatar => {
        index++
        check = ((((avatar.x < vm.myAvatar.x + 25) && (avatar.x > vm.myAvatar.x - 25)) && ((avatar.y < vm.myAvatar.y + 25) && (avatar.y > vm.myAvatar.y - 25))) && avatar.id !== vm.myAvatar.id)
        return (check)
      })
      if (eatChick !== undefined) {
        firebase.database().ref('avatars/' + eatChick.id).remove()
        vm.myAvatar.score += 10
        firebase.database().ref('avatars/' + vm.myAvatar.id).update({
          score: vm.myAvatar.score
        })
      }
      if (vm.myAvatar.score < 0) {
        clearInterval(vm.active)
        firebase.database().ref('avatars/' + myId).remove()
      }
    },
    outOfArea () {
      let vm = this
      clearInterval(vm.active)
    },
    mousePosition () {
      let vm = this
      let position = window.event
      vm.mouseX = position.clientX
      vm.mouseY = position.clientY
      let face = vm.myAvatar.color.toString()
      vm.actionChick(vm, face)
    },
    actionChick (vm, face) {
      if (vm.myAvatar.eat && vm.myAvatar.face !== vm.f + '-0') {
        firebase.database().ref('avatars/' + vm.myAvatar.id).update({
          face: vm.myAvatar.face + '-0'
        })
      }
    },
    upSpeed () {
      if (!this.myAvatar.speed) {
        this.time = 10
        clearInterval(this.active)
        this.move(this.time)
        firebase.database().ref('avatars/' + this.myAvatar.id).update({
          speed: true
        })
      }
    },
    normalSpeed () {
      this.time = 20
      clearInterval(this.active)
      this.move(this.time)
      firebase.database().ref('avatars/' + this.myAvatar.id).update({
        speed: false
      })
    },
    eat () {
      this.myAvatar.face = this.myAvatar.face.toString()
      if (this.myAvatar.face.search('-0') === -1 && !this.myAvatar.eat) {
        firebase.database().ref('avatars/' + this.myAvatar.id).update({
          eat: true
        })
      }
      this.checkEat()
    },
    shutup () {
      firebase.database().ref('avatars/' + this.myAvatar.id).update({
        face: this.myAvatar.face.replace('-0', ''),
        eat: false
      })
    },
    foodsGen () {
      var newfood
      var vm = this
      var length = 0

      newfood = {
        color: Math.floor(Math.random() * 3) + 1,
        x: Math.floor(Math.random() * 2900) + 50,
        y: Math.floor(Math.random() * 2778) + 50
      }
      vm.addfood(newfood)
      setInterval(function () {
        if (length < 10) {
          newfood = {
            color: Math.floor(Math.random() * 3) + 1,
            x: Math.floor(Math.random() * 2900) + 50,
            y: Math.floor(Math.random() * 2778) + 50
          }
          vm.addfood(newfood)
          length = vm.foods.length
        }
      }, 1000 * 60 * 5)
    },
    addfood (newfood) {
      Foods.push(newfood)
    }
  }
}
</script>
<style src="../static/css/game.css"> </style>
