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
		this.rigidBody = this.buildRigidBody();
	};

	Lander.prototype.buildRigidBody = function() {
		var radius = 1.0;
		var mass = 10;
		var position = this.entity.transformComponent.transform.translation;
		var rigidBody = PhysicalWorld.createAmmoJSSphere(radius, [position.x, position.y, position.z], mass);
		PhysicalWorld.addRigidBody(rigidBody);
		this.addScript(PhysicalWorld.createAmmoComponentScript(rigidBody));
		return rigidBody;
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
	};

	return Lander;

});
