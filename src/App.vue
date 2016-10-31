<template>
  <div v-show="wait">
    <div class="bgUpName"></div>
    <div v-show="checkName">
      <div v-if = "checkFull" class="popUpName">
        <h4>
          Server is Full !!
        </h4>
      </div>
      <div v-else class="popUpName">
        <input v-model="myAvatar.name" type="text" placeholder="Guest">
        <button class="button play" @click="letPlay">play</button>
        <br>
        <br>
        <h5 style="font-family: sans-serif; color: #CCCCCC; font-size: 2em;">
          Score < 0 , Consumed , Nood is Die
        </h5>
      </div>
    </div>
    <div v-show="!checkName" class="popUpName">
      <h4 style="font-family: sans-serif; color: #00CC00; font-size: 2em;">
        Ready in {{waitingTime}}
      </h4>
    </div>
  </div>
  <div @mousemove="mousePosition()">
    <div class="screen" @mouseover="move(time)" @mouseout="outOfArea">

      <div class="avatar" :style="{'top': avatar.y-myAvatar.y+(halfHeight)-(halfHeight*0.05) + 'px', 'left': avatar.x-myAvatar.x+halfWidth-(halfWidth*0.1) + 'px'}" v-for="avatar in avatars">
        <div style="text-align: center; z-index: 100;">
          <a style="font-family: Lucida Console; font-weight: bolder; color: #00CC00; font-size: 1.5em;">
            {{avatar.name}}
          </a>
          <br>
            <img :src="'../static/img/' + avatar.body + '.png'" width="70%"/>
            <br>
            <img :src="'../static/img/LEG' + avatar.leg1 + '.png'" width="10%"/>
            <img :src="'../static/img/LEG' + avatar.leg2 + '.png'" width="10%"/>
        </div>
        <img v-if="myAvatar.id === avatar.id" src="../static/img/gird-bg.png" :style="{'position':'absolute', 'top': -avatar.y+(halfHeight*0.2) + 'px', 'left': -avatar.x+(halfWidth*0.2) + 'px'}"/>
        <div style="position: absolute;">
          <!-- <img src="../static/img/king.png" width="65" height="65" style="position: absolute; z-index: 999; top:5px; left:-1px;"/>
          -->
        </div>
      </div>

      <div v-show="!wait">
        <h3 style="font-size: 2em;">
          Score {{myAvatar.score}}
        </h3>
      </div>

      <div class="foods" :style="{'top': food.y-myAvatar.y+halfHeight + 'px', 'left': food.x-myAvatar.x+halfWidth + 'px'}" v-for="food in foods">
        <img :src="'../static/img/RICE0.png'" style="position: absolute; z-index: 99;" width="100%"/>
        <!-- <img v-if="myAvatar.id === avatar.id" src="../static/img/gird-bg.png" :style="{'position':'absolute', 'top': -myAvatar.y+25+(winHeight/2)-50 + 'px', 'left': -myAvatar.x+25+(winWidth/2)-50 + 'px'}" v-for="avatar in avatars"/>
        Ο -->
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
    let x = Math.floor(Math.random() * 2750)
    let y = Math.floor(Math.random() * 2788)
    let avatar = {
      x,
      y
    }
    let result = Avatars.push(avatar)
    myId = result.key

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
      avatar.body = snapshot.val().body
      avatar.leg1 = snapshot.val().leg1
      avatar.leg2 = snapshot.val().leg2
      avatar.speed = snapshot.val().speed
      avatar.eat = snapshot.val().eat
      avatar.score = snapshot.val().score
      // change
      if (vm.myAvatar.id === id) {
        vm.myAvatar.x = snapshot.val().x
        vm.myAvatar.y = snapshot.val().y
        vm.myAvatar.body = snapshot.val().body
        vm.myAvatar.leg1 = snapshot.val().leg1
        vm.myAvatar.leg2 = snapshot.val().leg2
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
    // let r = Math.floor(Math.random() * 255)
    // let g = Math.floor(Math.random() * 255)
    // let b = Math.floor(Math.random() * 255)
    // camera = 1024*768 or 800*600
    // bg = 3000 × 2988
    // coner = 25 × 0
    // 25
    // coner = 2975 × 2913
    // 25 75
    // 2950
    // 2838
    // let body = Math.floor(Math.random() * 3) + 1
    let winHeight = window.innerHeight
    let winWidth = window.innerWidth

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
      myAvatar: {
        name: '',
        // color: `${chickColor}`, // color: `rgb(${r}, ${g}, ${b})`,
        x: 0,
        y: 0,
        body: '',
        color: '',
        leg1: '',
        leg2: '',
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
    gameStart () {
      let vm = this
      setInterval(function () {
        vm.winHeight = window.innerHeight
        vm.winWidth = window.innerWidth
      }, 10)
      vm.myAvatar.x = Math.floor(Math.random() * 2850)
      vm.myAvatar.y = Math.floor(Math.random() * 2888)
      firebase.database().ref('avatars/' + myId).remove()
      vm.addAvatar(vm.myAvatar)
    },
    letPlay () {
      let vm = this
      vm.checkName = false
      // this.$socket.emit('my other event', { my: 'data' })
      // vm.$socket.emit('put name', { my: vm.myAvatar.name })
      // vm.$socket.on('news', function (data) {
      //   console.log(data)
      //   console.log(1)
      // })
      let i = 0
      let waiting = setInterval(function () {
        // console.log(i)
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
      // @keydown.z="upSpeed"
      // @keyup.z="normalSpeed"
      // @keydown.x="eat"
      // @keyup.x="shutup"
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
      let body = Math.floor(Math.random() * 3) + 1
      vm.myAvatar.x = Math.floor(Math.random() * 2950) + 25
      vm.myAvatar.y = Math.floor(Math.random() * 2838)
      vm.myAvatar.body = body + '-7'
      vm.myAvatar.color = body
      vm.myAvatar.leg1 = '1'
      vm.myAvatar.leg2 = '1'
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
      let i = 0
      var e2 = 0
      // var checkArea = (((xOrigin < 0 || yOrigin < 0) && (x1 < xCenter || y1 < yCenter)) || ((xOrigin > 3000 || yOrigin > 2988) && (x1 > xCenter || y1 > yCenter)))
      // var checkCenter = ((xCenter + 25 > x1) && (xCenter - 25 < x1)) && ((yCenter - 25 < y1) && (yCenter + 25 > y1))
      vm.active = setInterval(function () {
        // if (vm.checkName != true) {
        if (i === 10) {
          xOrigin = vm.myAvatar.x
          yOrigin = vm.myAvatar.y
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
          if (yOrigin < 100 && y1 < yCenter) {
            yOrigin = 100
          }
          if (xOrigin < 75 && x1 < xCenter) {
            xOrigin = 75
          }
          if (yOrigin > 2975 && y1 > yCenter) {
            yOrigin = 2975
          }
          if (xOrigin > 3025 && x1 > xCenter) {
            xOrigin = 3025
          }
          vm.actionLeg()
        }
      }, time)
    },
    checkEat () {
      var vm = this
      var eatFood = 0
      var index = 0
      var check = 0
      // vm.avatars.findIndex(avatar => (avatar.x === vm.myAvatar.x && avatar.y === vm.myAvatar.y))
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
        var count = 0
        var feather = setInterval(function () {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: vm.myAvatar.color + 'Feather',
            leg1: 'undefined',
            leg2: 'undefined'
          })
          count++
          if (count === 100) {
            firebase.database().ref('avatars/' + myId).remove()
            clearInterval(feather)
          }
        }, 0)
      }
    },
    outOfArea () {
      // console.log('out of area')
      let vm = this
      clearInterval(vm.active)
    },
    mousePosition () {
      let vm = this
      let position = window.event
      vm.mouseX = position.clientX
      vm.mouseY = position.clientY
      let body = vm.myAvatar.color.toString()
      let slope = (vm.winHeight / 2 - vm.mouseY) / (vm.winWidth / 2 - vm.mouseX)
      vm.actionChick(vm, body, slope)
    },
    actionChick (vm, body, slope) {
      // console.log(slope)
      if (vm.mouseX > vm.winWidth / 2 && vm.mouseY > vm.winHeight / 2) { // q 4
        if (slope < 0.25) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-1'
          })
        } else if (slope < 0.75) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-8'
          })
        } else {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-7'
          })
        }
      } else if (vm.mouseX > vm.winWidth / 2 && vm.mouseY < vm.winHeight / 2) { // q1
        if (slope < -0.75) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-3'
          })
        } else if (slope < -0.25) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-2'
          })
        } else {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-1'
          })
        }
      } else if (vm.mouseX < vm.winWidth / 2 && vm.mouseY < vm.winHeight / 2) { // q2
        if (slope < 0.25) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-5'
          })
        } else if (slope < 0.75) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-4'
          })
        } else {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-3'
          })
        }
      } else if (vm.mouseX < vm.winWidth / 2 && vm.mouseY > vm.winHeight / 2) { // q3
        if (slope > -0.25) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-5'
          })
        } else if (slope > -0.75) {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-6'
          })
        } else {
          firebase.database().ref('avatars/' + vm.myAvatar.id).update({
            body: body + '-7'
          })
        }
      }
      if (vm.myAvatar.eat) {
        firebase.database().ref('avatars/' + vm.myAvatar.id).update({
          body: this.myAvatar.body + '-0'
        })
      }
    },
    actionLeg () {
      let vm = this
      if (vm.myAvatar.x % 24 === 0 || vm.myAvatar.y % 24 === 0) {
        firebase.database().ref('avatars/' + vm.myAvatar.id).update({
          leg1: '1',
          leg2: '3'
        })
      } else if (vm.myAvatar.x % 11 === 0 || vm.myAvatar.y % 11 === 0) {
        firebase.database().ref('avatars/' + vm.myAvatar.id).update({
          leg1: '2',
          leg2: '1'
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
      if (this.myAvatar.body.search('-0') === -1 && !this.myAvatar.eat) {
        firebase.database().ref('avatars/' + this.myAvatar.id).update({
          eat: true
        })
      }
      this.checkEat()
    },
    shutup () {
      firebase.database().ref('avatars/' + this.myAvatar.id).update({
        body: this.myAvatar.body.replace('-0', ''),
        eat: false
      })
    },
    foodsGen () {
      var newfood
      var vm = this
      var length = 0

      newfood = {
        x: Math.floor(Math.random() * 2950),
        y: Math.floor(Math.random() * 2838)
      }
      vm.addfood(newfood)
      setInterval(function () {
        if (length < 10) {
          newfood = {
            x: Math.floor(Math.random() * 2950),
            y: Math.floor(Math.random() * 2838)
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

<style>
html {
  overflow:hidden;
  zoom: reset;
}
div.screen {
  position: relative;
  width: 101vw;
  height: 101vh;
  top: -10px;
  left: -10px;
  overflow:hidden;
  border-color: #FFFFFF;
}
div#outOfArea {
  width: 100vw;
  height: 100vh;
}
div.avatar {
  position: absolute;
  width: 10%;
  height: 10%;
}
div.foods {
  position: absolute;
  width: 10px;
  height: 10px;
}
div.popUpName {
  position: fixed;
  z-index: 9999;
  background-color: white;
  top: 50%;
  left: 50%;
  width: 400px;
  height: 50px;
  margin-top: -100px;
  margin-left: -200px;
  align-items: center;
  text-align: center;
  padding: 60px 0;
  border: 3px solid #977797;
  text-align: center;
  border-radius: 8px;
}
div.bgUpName {
  position: fixed;
  opacity:0.4;
  filter:alpha(opacity=40); /* For IE8 and earlier */
  background-color:#000000;
  background-size:100%;
  width: 105%;
  height: 105%;
  z-index: 9998;
  top: -5px;
  left: -5px;
}
button.button {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 8px;
}
button.play {
  background-color: white;
  color: black;
  border: 2px solid #979797;
}
button.play:hover {
  background-color: #979797;
  color: white;
}
input[type=text], select {
  padding: 8px 16px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
div,score {
  position: absolute;
  font-family: sans-serif;
  bottom: 0;
  right: 0;
}
</style>
