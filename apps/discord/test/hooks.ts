import sinon from "sinon";

export default {
	mochaHooks: {
		afterEach() {
			sinon.restore();
		},
	},
};
