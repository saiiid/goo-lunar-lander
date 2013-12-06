define([
'goo/math/Vector3',
'goo/entities/components/TransformComponent',
'goo/entities/components/ScriptComponent',

'js/Prop',
'js/physics/PhysicalWorld'
],
function (
Vector3,
TransformComponent,
ScriptComponent,
Prop,
PhysicalWorld
) {


	function Lander(entity, properties, goo) {
		console.log("Creating Lander");
		Prop.call(this, entity, properties, goo);
		this.name = "Lander";
	};

	Lander.prototype = Object.create(Prop.prototype);

	Lander.prototype.initPhysics = function() {
		console.log('Initializing Lander physics');
		this.rigidBody = {}
		this.buildRigidBody(this.position, this.scale);
	};

	Lander.prototype.buildRigidBody = function(position, scale) {
		var radius = 2.0 * scale;
		var mass = 10;
		this.rigidBody = PhysicalWorld.createAmmoJSSphere(radius, [position.x, position.y, position.z], mass);
		PhysicalWorld.addRigidBody(this.rigidBody);
		this.addScript(PhysicalWorld.createAmmoComponentScript(this.rigidBody));
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
