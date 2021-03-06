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

	function SpotLight(entity, goo) {
		console.log("Creating SpotLight");
		Prop.call(this, entity, goo);
		this.name = "SpotLight";
		console.log(this.entity);

	};

	SpotLight.prototype = Object.create(Prop.prototype);

	SpotLight.prototype.initPhysics = function() {
		console.log('Initializing SpotLight physics');
		this.rigidBody = this.buildRigidBody();
	};

	SpotLight.prototype.buildRigidBody = function() {
		var radius = 1.0;
		var mass = 10;
		var position = this.entity.transformComponent.transform.translation;
		var rigidBody = PhysicalWorld.createAmmoJSSphere(radius, position, mass);
		PhysicalWorld.addRigidBody(rigidBody);
		this.addScript(PhysicalWorld.createAmmoComponentScript(rigidBody));
		AmmoDebugShapeCreator.createSphere(this.entity, radius);
		return rigidBody;
	};

	return SpotLight;

});
