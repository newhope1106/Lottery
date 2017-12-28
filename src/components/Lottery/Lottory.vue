<template>
  <div class="center">
    <div class="container" id="container">
      <div id="turntable">
      </div>
      <img :src=imageUrl class="btn" v-on:click="starLottery" />
    </div>
  </div>
</template>
<script>
  import $ from 'n-zepto'

  export default {
    name: 'lottery',
    data: function () {
      return {
        imageUrl: './static/images/lottery/btn.png',
      }
    },
    methods: {
      init: function (options) {
        this.opts = this.extend({}, this.defaultOpts(), options);
        if (!this.opts.values) {
          throw Error('values必须要有值');
        }

        var half = this.opts.size / 2;
        this.center = {
          x: half,
          y: half,
          r: half,
        };

        //圆的x轴坐标
        this.startPoint = {
          x: this.opts.size,
          y: half,
        };

        this.values = this.opts.values;
        this.count = this.opts.values.length;
        this.degree = 360 / this.count;

        this.container = null;
        this.svg = null;

        if (this.opts.container) { this.draw(this.opts.container); }
      },
      defaultOpts: function() {
        return {
          type: 'frame',
          size: 320,
          textSpace: 15,
          imgSpace: 50,
          speed: 5,
          fastSpeed: 10,
          slowSpeed: 5,
          speedUp: 2000,
          speedDown: 2000,
          values: [],
          className: 'turntable-effect',
          ring: 8,
        }
      },
      appendCSS: function (css) {
        var head = document.head || document.getElementsByTagName('head')[0]
        var style = document.createElement('style')
        style.appendChild(document.createTextNode(css))
        head.appendChild(style)
      },
      requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
      extend: function (target) {
        var arguments$1 = arguments

        for (var i = 0; i < arguments.length; i++) {
          var arg = arguments$1[i]
          for (var p in arg) {
            target[p] = arg[p]
          }
        }
        return target
      },
      random: function (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1))
      },
      getValueIndexById: function (id) {
        var r = this.values.filter(function (d) { return d.id == id }).map(function (d) { return d.index })

        return r[this.random(0, r.length - 1)];
      },
      getValueDegreeByIndex: function (index) {
        return this.values[index].degree
      },
      setTransform: function (val) {
        this.svg.style.msTransform = val;
        this.svg.style.oTransform = val;
        this.svg.style.mozTransform = val;
        this.svg.style.webkitTransform = val;
        this.svg.style.transform = val;
      },
      turning: function () {
        this.turnTotal += this.turnBase;
        if (this.turnTotal >= 360 || this.turnTotal <= -360) { this.turnTotal = 0 }

        this.setTransform('rotate(' + -this.turnTotal + 'deg)')
      },
      turned: function () {
        if (this.turnTotal >= 360 || this.turnTotal <= -360) { this.turnTotal = 0 }
        this.turnTotal += this.turnBase;

        if (parseInt(this.turnTotal, 10) == parseInt(this.turnEndDegree)) {
          cancelAnimationFrame(this.animation)
          this.setTransform('rotate(' + -this.turnTotal + 'deg)')
          this.isTurning = false
          this.turnCallback(this.opts.values[this.index])
          return false
        }
        this.setTransform('rotate(' + -this.turnTotal + 'deg)')
        return true
      },
      turn: function () {
        this.animation = requestAnimationFrame(function() {
          if (!this.isTurnStop) {
            this.turning();
            this.turn();
          } else {
            if (this.turned()) {
              this.turn();
            }
          }
        }.bind(this));
      },
      start: function () {
        if (this.isTurning) { return; }
        this.turnBase = this.opts.speed;
        this.turnTotal = 0;
        this.isTurnStop = false;
        this.index = null;
        this.isTurning = true;
        this.turn();

        setTimeout(function() {
          this.turnBase = this.opts.fastSpeed;
        }.bind(this), this.opts.speedUp);
      },
      stop: function (id, cb) {
        this.index = this.getValueIndexById(id);
        this.turnEndDegree = this.getValueDegreeByIndex(this.index);
        this.turnBase = this.opts.slowSpeed;
        if (typeof cb !== 'function') { cb = function() {}; }
        this.turnCallback = cb;

        setTimeout(function() {
          this.turnBase = 1;
          this.isTurnStop = true;
        }.bind(this), this.opts.speedDown);
      },
      goto: function (id, cb) {
        if (this.isTurning) { return; }
        this.isTurning = true;
        var deg = Math.abs(this.svg.style.transform.replace('rotate(', '').replace('deg)', '') || 0);
        var ndeg = deg != 0 ? Math.abs(this.turnEndDegree) : 0;
        ndeg = Math.abs(this.opts.ring * 360 + deg - ndeg);

        this.index = this.getValueIndexById(id);
        this.turnEndDegree = 360 - this.getValueDegreeByIndex(this.index);
        this.turnCallback = cb;

        this.setTransform(("rotate(" + (ndeg + this.turnEndDegree) + "deg)"));
      },
      movePoint: function (oPoint, tPoint, dis, len) {
        var x = -1 * ((dis * (tPoint.x - oPoint.x) / len - tPoint.x))
        var y = -1 * ((dis * (tPoint.y - oPoint.y) / len - tPoint.y))
        return { x: x, y: y }
      },
      getPathPoint: function (oPoint, degree) {
        return {
          x: oPoint.x + oPoint.r * Math.cos(degree * (Math.PI / 180)),
          y: oPoint.y + oPoint.r * Math.sin(degree * (Math.PI / 180)),
          degree: degree
        }
      },
      setAttrs: function (ele, attrs) {
        for (var t in attrs) {
          if (t == 'href') { ele.setAttributeNS('http://www.w3.org/1999/xlink', t, attrs[t]) }
          else { ele.setAttribute(t, attrs[t]) }
        }

        return ele
      },
      createSvgElement: function (name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name)
      },
      getPointsDistance: function (o, t) {
        return Math.sqrt(Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2))
      },
      draw: function (container) {
        var this$1 = this;

        var that = this;
        this.container = container;

        var svg = this.setAttrs(this.createSvgElement('svg'), {
          width: this.opts.size,
          height: this.opts.size,
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink'
        });

        var degree = this.degree;
        var pathStartPoint = this.startPoint;
        var pathEndPoint = this.getPathPoint(this.center, degree);

        var target = this;
        this.values = this.values.map(function (info, i) {
          info.degree = i == 0 ? 90 + this$1.degree / 2 : this$1.values[i - 1].degree + this$1.degree;
          if (info.degree >= 360) { info.degree = info.degree - 360; }
          info.index = i;

          var g = target.createSvgElement('g');

          var path = target.setAttrs(target.createSvgElement('path'), {
            fill: info.bg,
            d: ("\n          M" + (this$1.center.x) + ", " + (this$1.center.y) + "\n          L" + (pathStartPoint.x) + ", " + (pathStartPoint.y) + "\n          A" + (this$1.center.x) + ", " + (this$1.center.y) + "\n          1 0, 1\n          " + (pathEndPoint.x) + ", " + (pathEndPoint.y) + "\n          z\n        ")
          });

          g.appendChild(path);

          var fanCenterPoint = {
            x: (pathEndPoint.x + pathStartPoint.x) / 2,
            y: (pathEndPoint.y + pathStartPoint.y) / 2
          };

          var centerDistance = target.getPointsDistance(fanCenterPoint, this$1.center);

          var textDegree = 180 - ((360 - this$1.degree * 2) / 2) / 2;
          var textPoint = target.movePoint(this$1.center, fanCenterPoint, this$1.opts.textSpace, centerDistance);
          var rotate = textDegree + this$1.degree * i;

          var text = target.setAttrs(target.createSvgElement('text'), {
            x: textPoint.x,
            y: textPoint.y,
            'text-anchor': 'middle',
            fill: info.color,
            transform: ("rotate(" + rotate + ", " + (textPoint.x) + ", " + (textPoint.y) + ")")
          });
          text.appendChild(document.createTextNode(info.name));

          g.appendChild(text);

          if (info.img) {
            var imgPoint = target.movePoint(this$1.center, fanCenterPoint, this$1.opts.imgSpace, centerDistance);
            var img = target.setAttrs(target.createSvgElement('image'), {
              width: info.img.width,
              height: info.img.height,
              href: info.img.src,
              x: imgPoint.x,
              y: imgPoint.y,
              transform: ("rotate(" + rotate + ", " + (imgPoint.x) + ", " + (imgPoint.y) + ") translate(" + (-(info.img.width / 2)) + ", " + (-(info.img.height / 2)) + ")")
            });
            g.appendChild(img);
          }

          svg.appendChild(g);

          pathStartPoint = pathEndPoint;
          pathEndPoint = target.getPathPoint(this$1.center, this$1.degree + this$1.degree * (i + 1));

          return info;
        });

        container.appendChild(svg);
        this.svg = svg;

        if (this.opts.type == 'transition') { this.initTransition(); }
      },
      initTransition: function () {
        var this$1 = this;

        this.setAttrs(this.svg, {class: this.opts.className});

        this.svg.addEventListener('transitionend', function () {
          this$1.isTurning = false;
          this$1.turnCallback(this$1.values[this$1.index]);
        }, false);

        this.appendCSS(("\n      ." + (this.opts.className) + " {\n        -webkit-transition: -webkit-transform " + (this.opts.speed) + "s ease-in-out;\n        transition: transform " + (this.opts.speed) + "s ease-in-out;\n      }\n    "));
      },
      starLottery: function () {
        //这里指定转到哪个位置，从后台获取
        this.goto(1, function(val) {
          console.log(val);
          alert('恭喜你中了' + val.name);
        });
      }
    },
    mounted: function () {
      var eleWidth = $("#container").width();
      $("#container").css("left", ($(document).width() - eleWidth)/2 + "px");
      this.init({
        type: 'transition',
        size: 320,
        textSpace: 15,
        imgSpace: 54,
        values: [
          {
            id: 0,
            name: '感谢参与',
            img: {
              width: 50,
              height: 50,
              src: './static/images/lottery/thanks.png'
            },
            color: '#fc796f',
            bg: '#fffdeb'
          },
          {
            id: 1,
            name: 'M+T恤',
            img: {
              width: 45,
              height: 57,
              src: './static/images/lottery/tshirt.png'
            },
            color: '#fbe0e1',
            bg: '#ed6e71'
          },
          {
            id: 2,
            name: '太空杯',
            img: {
              width: 45,
              height: 57,
              src: './static/images/lottery/cup.png'
            },
            color: '#fc796f',
            bg: '#fffdeb'
          },
          {
            id: 3,
            name: '电影券',
            img: {
              width: 50,
              height: 35,
              src: './static/images/lottery/movie.png'
            },
            color: '#fbe0e1',
            bg: '#ed6e71'
          },
          {
            id: 0,
            name: '感谢参与',
            img: {
              width: 50,
              height: 50,
              src: './static/images/lottery/thanks.png'
            },
            color: '#fc796f',
            bg: '#fffdeb'
          },
          {
            id: 4,
            name: '魅族雨伞',
            img: {
              width: 50,
              height: 35,
              src: './static/images/lottery/umbrella.png'
            },
            color: '#fbe0e1',
            bg: '#ed6e71'
          },
          {
            id: 5,
            name: 'Pro 5',
            img: {
              width: 30,
              height: 60,
              src: './static/images/lottery/pro5.png'
            },
            color: '#fc796f',
            bg: '#fffdeb'
          },
          {
            id: 6,
            name: '魅蓝metal',
            img: {
              width: 30,
              height: 57,
              src: './static/images/lottery/metal.png'
            },
            color: '#fbe0e1',
            bg: '#ed6e71'
          },
        ]
      })

      this.draw(document.getElementById('turntable'));
      this.isTurning = false;
    }
  }
</script>
<style scoped>
  body {
    font-family: Georgia, "Times New Roman", "Microsoft YaHei", "微软雅黑", STXihei, "华文细黑", serif;
  }

  .center{
    margin: 0 auto;
    text-align: center;
    width: 100%;
  }

  .container {
    position: relative;
    box-sizing: border-box;
    width: 350px;
    height: 350px;
    padding: 15px;
    border-radius: 50%;
  }

  .container .btn {
    position: absolute;
    width: 86px;
    top: 50%;
    left: 50%;
    margin-left: -43px;
    margin-top: -52.5px;
    transform: translateZ(0);
    outline: 1px solid transparent;
  }
</style>
