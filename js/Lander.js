define([
'goo/math/Vector3',
'goo/entities/components/TransformComponent',
'goo/entities/components/ScriptComponent',

'js/Prop',
'js/physics/PhysicalWorld',

'js/AmmoDebugShapeCreator'
],
function (
Vector3,
TransformComponent,
ScriptComponent,
Prop,
PhysicalWorld,

AmmoDebugShapeCreator
) {

	function Lander(entity) {
		console.log("Creating Lander");
		Prop.call(this, entity);
		this.name = "Lander";
	};

	Lander.prototype = Object.create(Prop.prototype);

	Lander.prototype.initPhysics = function() {
		console.log('Initializing Lander physics');
		this.rigidBody = this.buildRigidBody();
	};

	Lander.prototype.buildRigidBody = function() {
		var radius = 0.2;
		var mass = 10;
		var position = this.entity.transformComponent.transform.translation;
		//position = new Vector3(0,0,0);
		var rigidBody = PhysicalWorld.createAmmoJSSphere(radius, position, mass);
		PhysicalWorld.addRigidBody(rigidBody);
		this.addScript(PhysicalWorld.createAmmoComponentScript(rigidBody));

		AmmoDebugShapeCreator.createSphere(this.entity, radius);

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
