import VueResolver from "./resolvers/Vue";
import isReactComponent from "./utils/isReactComponent";

export default {
	install(Vue, options) {
		const originalComponentsMergeStrategy =
			Vue.config.optionMergeStrategies.components;

		Vue.config.optionMergeStrategies.components = function (parent, ...args) {
			const mergedValue = originalComponentsMergeStrategy(parent, ...args);
			const wrappedComponents = mergedValue
				? Object.entries(mergedValue).reduce(
						(acc, [k, v]) => ({
							...acc,
							[k]: isReactComponent(v) ? VueResolver : v,
						}),
						{},
				  )
				: mergedValue;
			return Object.assign(mergedValue, wrappedComponents);
		};
		Vue.prototype.constructor.isVue = true;
	},
};
