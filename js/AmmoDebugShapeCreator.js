define([
	'goo/entities/EntityUtils',
	'goo/shapes/ShapeCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Material',
	'js/physics/PhysicalWorld'
],
function (
	EntityUtils,
	ShapeCreator,
	ShaderLib,
	Material,
	PhysicalWorld
	)
{
	var defaultMaterial = Material.createMaterial(ShaderLib.simpleLit);
	defaultMaterial.wireframe = true;
	defaultMaterial.materialState.diffuse = [1.0, 0, 0, 1.0];

	function AmmoDebugShapeCreator() {
	}

	AmmoDebugShapeCreator._setChild = function(childEntity, parentEntity) {
		parentEntity.transformComponent.attachChild(childEntity.transformComponent);
	};

	AmmoDebugShapeCreator.createSphere = function (parentEntity, rigidBody, radius) {
		var zSamples = 16;
		var radialSamples = 16;
		var shape = ShapeCreator.createSphere(zSamples, radialSamples, radius);
		// var script = PhysicalWorld.createAmmoComponentScript(rigidBody);
		var entity = EntityUtils.createTypicalEntity(parentEntity._world, shape, defaultMaterial);
		entity.addToWorld();
	};

	AmmoDebugShapeCreator.createBox = function (parentEntity, width, height, depth, world, position) {
		var shape = ShapeCreator.createBox(width, height, depth);
		if (parentEntity == null) {
			var entity = EntityUtils.createTypicalEntity(world, shape, defaultMaterial);
		} else {
			var entity = EntityUtils.createTypicalEntity(parentEntity._world, shape, defaultMaterial);
			this._setChild(entity, parentEntity);
		}
		entity.transformComponent.setTranslation(position);
		entity.addToWorld();
	};

	return AmmoDebugShapeCreator;
});
