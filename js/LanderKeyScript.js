define([
],
function(
) {
	"use strict";

	function LanderKeyScript(lander, properties) {

		this.name = "LanderKeyScript";

		this.lander = lander;

		this.nearLeftKey = properties.nearLeftKey;
		this.farLeftKey = properties.farLeftKey;
		this.nearRightKey = properties.nearRightKey;
		this.farRightKey = properties.farRightKey;

		// Controls amount of firing events per second
		this.firingRate = !isNaN(properties.firingRate) ? properties.firingRate : 10;
		this.firingInterval = 1.0 / this.firingRate;

		this.firingTimer = [this.firingInterval, this.firingInterval, this.firingInterval, this.firingInterval];
		this.keyState = [0, 0, 0, 0];

	};

	LanderKeyScript.prototype.updateKeys = function(event, down) {

		if (event.altKey) {
			return;
		}

		switch (event.keyCode) {
			case this.nearLeftKey:
				this.keyState[0] = down ? 1 : 0;
				break;
			case this.farLeftKey:
				this.keyState[1] = down ? 1 : 0;
				break;
			case this.nearRightKey:
				this.keyState[2] = down ? 1 : 0;
				break;
			case this.farRightKey:
				this.keyState[3] = down ? 1 : 0
				break;
		}
	};

	LanderKeyScript.prototype.setupKeyControls = function() {
		var that = this;
		this.domElement.setAttribute('tabindex', -1);
		this.domElement.addEventListener('keydown', function (event) {
			that.updateKeys(event, true);
		}, false);

		this.domElement.addEventListener('keyup', function (event) {
			that.updateKeys(event, false);
		}, false);
	};

	LanderKeyScript.prototype.run = function (entity, tpf, env) {

		if(env) {
			if (!this.domElement && env.domElement) {
				this.domElement = env.domElement;
				this.setupKeyControls();
			}
		}

		for (var each in this.firingTimer) {
			this.firingTimer[each] -= tpf;
		}

		for (var i=0; i<this.firingTimer.length; i++) {
			this.firingTimer[i] -= tpf;
			if (this.firingTimer[i] < 0.0 && this.keyState[i]) {
				this.lander.turnOnThruster(i); 
				this.firingTimer[i] = this.firingInterval;
			} else {
				this.lander.turnOffThruster(i);
			}
		}

	};

	return LanderKeyScript;

});