import React from "react";
import { createApp, h } from "vue";
import config from "../config";
import ReactWrapper from "./React";

const VUE_COMPONENT_NAME = "nani-internal-component-name";

const wrapReactChildren = (createElement, children) =>
	createElement("nani-internal-react-wrapper", {
		props: {
			component: () => h("div", null, children),
		},
	});

export default class VueContainer extends React.PureComponent {
	constructor(props) {
		super(props);

		this.currentVueComponent = props.component;

		const createVueInstance = this.createVueInstance;
		const self = this;
		this.createVueInstance = function (element) {
			createVueInstance.call(self, element);
		};
	}

	UNSAFE_componentDidUpdate(
		prevProps: Readonly<{}>,
		prevState: Readonly<{}>,
		snapshot?: any,
	): void {
		const { component, ...props } = this.props;

		if (prevProps.component !== component) {
			this.updateVueComponent(prevProps.component, component);
		}

		Object.assign(this.vueInstanceProxy.$data, props);
	}

	UNSAFE_componentWillMount(): void {
		() => {
			this.vueInstance.unount();
		};
	}

	createVueInstance(targetElement: HTMLElement | null) {
		const { component, on, ...props } = this.props;

		const vueApp = createApp({
			data: () => props,
			...config.vueInstanceOptions,
			render() {
				return h(
					VUE_COMPONENT_NAME,
					{
						...this.$props,
						...this.$attrs,
						on,
					},
					[wrapReactChildren(h, this.children)],
				);
			},
		});

		const VueComponent = {
			render() {
				return h(component, {
					...this.$props,
					...this.$attrs,
					on,
				});
			},
		};

		vueApp.component(VUE_COMPONENT_NAME, VueComponent);
		vueApp.component("nani-internal-react-wrapper", ReactWrapper);
	}

	updateVueComponent(prevComponent, nextComponent) {
		this.currentVueComponent = nextComponent;

		const VueComponent = {
			render() {
				return h(nextComponent, {
					...this.$props,
					...this.$attrs,
					on: this.$listeners,
				});
			},
		};

		this.vueInstanceProxy.component[VUE_COMPONENT_NAME] = VueComponent;
		this.vueInstanceProxy.__forceUpdate();
	}

	render() {
		return <div ref={this.createVueInstance.bind(this)} />;
	}
}
