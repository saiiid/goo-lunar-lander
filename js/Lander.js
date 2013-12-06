define([
'goo/math/Vector3',
'goo/entities/components/TransformComponent',
'goo/entities/components/ScriptComponent'

],
function (
Vector3,
TransformComponent,
ScriptComponent
) {

	function Lander(entity, properties, goo) {
		this.goo = goo;
		this.entity = entity;
		entity.addToWorld();
	};

	Lander.prototype.init = function(position, scale) {

		console.log('Initializing Lander');
		this.entity.transformComponent.setScale(scale, scale, scale);
		this.entity.transformComponent.addTranslation(position.x, position.y, position.z);
		this.entity.transformComponent.setUpdated();
		this.entity.addToWorld();

		this.roll = 0.0;
		this.pitch = 0.0;
		this.yaw = 0.0;

		this.scriptComponent = new ScriptComponent();
		this.entity.setComponent(this.scriptComponent);
	};

	Lander.prototype.addRoll = function(angle) {
		this.roll += angle;
	};

	Lander.prototype.addPitch = function(angle) {
		this.pitch += angle;
	};

	Lander.prototype.addYaw = function(angle) {
		this.yaw += angle;
	};

	Lander.prototype.addScript = function(script) {
		this.scriptComponent.scripts.push(script);
	};

	// Set rotation according to roll, pitch and yaw params
	Lander.prototype.updateRotation = function() {
		console.log('Updating Lander rotation');
		this.entity.transformComponent.setRotation(this.roll, this.pitch, this.yaw);
		this.entity.transformComponent.setUpdated();	
	};

	// Fire numbered thruster
	Lander.prototype.fireThruster = function(thruster) {
		console.log('Firing thruster ' + thruster);
	}

	return Lander;

});
