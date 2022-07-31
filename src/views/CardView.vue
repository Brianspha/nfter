<template>
  <v-card
    v-if="showing"
    class="card"
    v-bind:class="{ animated: animating, current: current }"
    v-bind:style="{ transform: returnTransformString }"
  >
    <v-img
      class="image-icon"
      :src="picture"
      :lazy-src="picture"
      aspect-ratio="1"
    ></v-img>
    <h1 class="name">{{ fullName }}</h1>
    <h2 class="price">
      {{ price }}
      <v-icon class="icon-eth" left>
        mdi-ethereum
      </v-icon>
      <v-row style="padding-top:5px;" justify="center">
        <vac style="font-weight:bold; color:black" :end-time="start">
          <template v-slot:process="{ timeObj }">
            <span
              >Starts In
              {{
                `${Math.round((timeObj.d / 1000 / (3600 * 24)) * 100)} days ${
                  timeObj.h
                }:${timeObj.m}:${timeObj.s}`
              }}
            </span>
          </template>
          <template v-slot:finish>
            <span>Auction in Progress</span>
          </template>
        </vac></v-row
      >
      <v-row style="padding-top:1px;" justify="center">
        <vac style="font-weight:bold; color:black" :end-time="expiry">
          <template v-slot:process="{ timeObj }">
            <span
              >Ends In
              {{
                `${(timeObj.d)
                          }  days ${
                  timeObj.h
                }:${timeObj.m}:${timeObj.s}`
              }}
            </span>
          </template>
          <template v-slot:finish>
            <span>Expired!</span>
          </template>
        </vac></v-row
      >
    </h2>
  </v-card>
</template>

<script>
var moment = require("moment");
export default {
  props: {
    current: { type: Boolean, required: true },
    fullName: { type: String, required: true },
    picture: { type: String, required: false },
    approved: { type: Boolean },
    price: { type: Number, required: true },
    expiry: { type: Number, required: true },
    start: { type: Number, required: true },
  },
  data: () => {
    return {
      moment: moment,
      todaysDate: new Date().getTime(),
      showing: true,
      maxStars: 5,
      animating: true, // Controls CSS class with transition declaration
      threshold: window.innerWidth / 3, // Breakpoint distance to approve/reject a card
      maxRotation: 20, // Max rotation value in degrees
      position: { x: 0, y: 0, rotation: 0 },
      icon: { opacity: 0, type: null },
    };
  },

  computed: {
    returnImageString() {
      return `url(${this.picture})`;
    },
    returnTransformString() {
      const {
        animating,
        approved,
        position: { x, y, rotation },
      } = this;

      if (!animating || approved !== null) {
        return `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      return null;
    },
  },
  beforeMount() {
    console.log("expiry: ", this.$props);
  },
  mounted() {
    interact(this.$el).draggable({
      inertia: false,
      onstart: () => (this.animating = false), // Disable CSS transitions during dragging
      onmove: ({ dx, dy }) => {
        /*
        	Calculate new x and y coordinate values from the local value and
        	the event object value. Also adjust element rotation transformation
        	based on proximity to approve/reject threshold.
        */
        const { position, maxRotation, threshold, icon } = this;

        const offsetX = (position.x || 0) + dx;
        const offsetY = (position.y || 0) + dy;

        position.x = offsetX;
        position.y = offsetY;

        position.rotation = maxRotation * (offsetX / threshold);
        if (position.rotation > maxRotation) {
          position.rotation = maxRotation;
        } else if (position.rotation < -maxRotation) {
          position.rotation = -maxRotation;
        }

        /*
        	Change icon image type based on drag direction and adjust opacity
        	from 0-1 based on current rotation amount. Also emit an event to
        	show/hide respective button below cards during dragging.
        */
        icon.type = "match";
        if (position.rotation < 0) {
          icon.type = "pass";
        }

        const opacityAmount = Math.abs(position.rotation) / maxRotation;
        icon.opacity = opacityAmount;
        this.$emit("draggedActive", icon.type, opacityAmount);
      },
      onend: () => {
        /*
        	Check if card has passed the approve/reject threshold and emit approval
        	value change event, otherwise reset card and icon to default values.
        */
        const { icon, position, threshold } = this;

        this.animating = true;

        icon.opacity = 1;
        if (position.x > threshold) {
          this.$emit("draggedThreshold", true);
        } else if (position.x < -threshold) {
          this.$emit("draggedThreshold", false);
          icon.opacity = 1;
        } else {
          position.x = 0;
          position.y = 0;
          position.rotation = 0;
          icon.opacity = 0;
        }

        this.$emit("draggedEnded");
      },
    });
  },
  watch: {
    approved() {
      const { approved, $el, position, maxRotation, icon } = this;

      if (approved !== null) {
        // Remove interact listener to prevent further dragging
        interact($el).unset();
        this.animating = true;

        /*
        	Move card off-screen in direction of approve/reject status,
        	then remove it from the DOM, thereby adjusting the CSS
        	nth-child selectors.
        */

        const x = window.innerWidth + window.innerWidth / 2 + $el.offsetWidth;

        position.x = x;
        position.rotation = maxRotation;
        icon.type = "match";

        if (!approved) {
          position.x = -x;
          position.rotation = -maxRotation;
          icon.type = "pass";
        }

        icon.opacity = 1;

        setTimeout(() => (this.showing = false), 200);
      }
    },
  },
};
</script>

<style scoped>
.card .stars .active,
.card .stars .inactive,
.card .image {
  background: center center no-repeat transparent;
  background-size: contain;
}

html {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  color: #444;
  overflow: hidden;
  background: #f3f3f3;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -moz-font-feature-settings: "liga" on;
}

*,
*:before,
*:after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.loading .loading-icon:before,
.loading .loading-icon:after,
.loading .loading-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -62.5px;
  margin-top: -62.5px;
}

.loading .loading-icon:before,
.loading .loading-icon:after {
  width: 125px;
  height: 125px;
  border-radius: 50%;
  border: 4px solid #fff;
}

.loading {
  z-index: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(221, 71, 209, 0.5);
}
.loading .loading-icon {
  width: 125px;
  height: 125px;
}
.loading .loading-icon:before,
.loading .loading-icon:after {
  content: "";
  display: block;
}
.loading .loading-icon:before {
  z-index: 0;
  -webkit-animation: 1s pulse infinite linear;
  animation: 1s pulse infinite linear;
}
.loading .loading-icon:after {
  z-index: 10;
  background: url("https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/advisor/wp-content/uploads/2021/04/NFT.jpeg.jpg")
    center center no-repeat #fff;
  background-size: cover;
}

@-webkit-keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}
.card-container {
  position: relative;
  width: 420px;
  height: 620px;
}

.card {
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  left: 0;
  top: 0;
  position: absolute;
  padding: 15px 15px 30px;
  width: 420px;
  height: 700px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transform: translateY(30px) scale(0.94);
  transform-origin: 50% 100%;
  will-change: transform, opacity;
}
.card:nth-child(1) {
  opacity: 1;
  z-index: 3;
  transform: translateY(0px) scale(1);
}
.card:nth-child(2) {
  opacity: 1;
  z-index: 2;
  transform: translateY(10px) scale(0.98);
}
.card:nth-child(3) {
  opacity: 1;
  z-index: 1;
  transform: translateY(20px) scale(0.96);
}
.card.current {
  pointer-events: auto;
}
.card.animated {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.card .image {
  margin: 0 auto 30px 0;
  width: 390px;
  height: 390px;
}
.card .image .image-icon {
  position: relative;
  left: 50%;
  top: 50%;
  width: 200px;
  height: 200px;
  transform: translateX(-50%) translateY(-50%);
  background: center center no-repeat transparent;
  background-size: contain;
}
.card .image .image-icon.match {
  background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/icon-approve.svg");
}
.card .image .image-icon.pass {
  background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/icon-reject.svg");
}
.card .name {
  margin: 0 auto 30px 0;
  display: block;
  font-size: 24px;
  line-height: 24px;
  text-align: center;
  text-transform: capitalize;
}
.card .price {
  margin: 0 auto 30px 0;
  display: block;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  text-transform: capitalize;
  color: gray;
}
.card .icon-eth {
  height: 2px;
}
.card .stars {
  margin: 0 auto;
  width: 216px;
}
.card .stars:after {
  content: "";
  display: table;
  clear: both;
}
.card .stars .active,
.card .stars .inactive {
  float: left;
  margin-right: 24px;
  width: 24px;
  height: 24px;
}
.card .stars .active:last-child,
.card .stars .inactive:last-child {
  margin-right: 0;
}
.card .stars .active {
  background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/star-active.svg");
}
.card .stars .inactive {
  background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/617753/star-inactive.svg");
}</style
>>
