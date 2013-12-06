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
		// TODO per thruster?
		this.firingRate = !isNaN(properties.firingRate) ? properties.firingRate : 10;
		this.firingTimer = 1.0 / this.firingRate;

		this.keyState = {
			nl: 0,
			fl: 0,
			nr: 0,
			fr: 0
		};

	};

	LanderKeyScript.prototype.updateKeys = function(event, down) {

		if (event.altKey) {
			return;
		}

		switch (event.keyCode) {
			case this.nearLeftKey:
				this.keyState.nl = down ? 1 : 0;
				break;
			case this.farLeftKey:
				this.keyState.fl = down ? 1 : 0;
				break;
			case this.nearRightKey:
				this.keyState.nr = down ? 1 : 0;
				break;
			case this.farRightKey:
				this.keyState.fr = down ? 1 : 0
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

		this.firingTimer -= tpf;
		if (this.firingTimer < 0.0) {
			if (this.keyState.nl) { this.lander.fireThruster(0); this.firingTimer = 1.0/this.firingRate; }
			if (this.keyState.fl) { this.lander.fireThruster(1); this.firingTimer = 1.0/this.firingRate; }
			if (this.keyState.nr) { this.lander.fireThruster(3); this.firingTimer = 1.0/this.firingRate; }
			if (this.keyState.fr) { this.lander.fireThruster(2); this.firingTimer = 1.0/this.firingRate; }
		}

	};

	return LanderKeyScript;

});