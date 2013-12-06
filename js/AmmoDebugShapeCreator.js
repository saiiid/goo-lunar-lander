define([
	'goo/entities/EntityUtils',
	'goo/shapes/ShapeCreator'
],
function (
	EntityUtils,
	ShapeCreator
	)
{

	function AmmoDebugShapeCreator(goo) {
		this.world = goo.world;
		var mat = Material.createMaterial(ShaderLib.simpleLit);
		mat.wireframe = true;
		mat.materialState.diffuse = [1.0, 0, 0, 1];
		this.defaultMaterial = mat;
	}

	AmmoDebugShapeCreator.prototype.createSphere = function (radius, position) {
		var zSamples = 16;
		var radialSamples = 16;
		var sphereShape = ShapeCreator.createSphere(zSamples, radialSamples, radius);
		var entity = EntityUtils.createTypicalEntity(this.world, sphereShape, this.defaultMaterial);
	};

	return AmmoDebugShapeCreator;
});
