import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import VueWrapper from "./Vue";

const makeReactContainer = (Component: any) => {
	return class ReactInVue extends React.Component {
		static displayName = `ReactInVue${
			Component.displayName || Component.name || "Component"
		}`;

		constructor(props: any) {
			super(props);

			(this as any).state = { ...props };
		}

		wrapVueChildren(children: any) {
			console.log("wrapVueChildren", children);
			return {
				render: (createElement: any) => createElement("div", children),
			};
		}

		render() {
			const { children, "": _invoker, ...rest } = (this as any).state;
			const wrappedChildren = this.wrapVueChildren(children);

			// needed as the VueContainer is not a valid JSX element
			const RenderVueWrapper = VueWrapper as unknown as (props: {
				component: any;
			}) => JSX.Element;

			return (
				<Component {...rest}>
					{children && <RenderVueWrapper component={wrappedChildren} />}
				</Component>
			);
		}
	};
};

export default {
	props: ["component", "passedProps"],
	render(createElement: any) {
		return createElement("div", { ref: "react" });
	},
	mounted() {
		this.mountReactComponent(this.$props.component);
	},
	beforeUmount() {
		ReactDOM.unmountComponentAtNode(this.$ref.react);
	},
	updated() {
		if (this.$slots.default !== undefined) {
			this.reactComponentRef.current.setState({
				children: this.$slots.default,
			});
		} else {
			this.reactComponentRef.current.setState({ children: null });
		}
	},
	inheritAttrs: false,
	watch: {
		$attrs: {
			handler() {
				this.reactComponentRef.current.setState({ ...this.$atttrs });
			},
			deep: true,
		},
		"$props.component": {
			handler(newValue) {
				this.mountReactComponent(newValue);
			},
		},
		$listeners: {
			handler() {
				this.reactComponentRef.current.setState({ ...this.$listeners });
			},
			deep: true,
		},
		"$props.passProps": {
			handler() {
				this.reactComponentRef.current.setState({ ...this.$props.passedProps });
			},
			deep: true,
		},
	},
	setup() {
		const reactComponentRef = useRef(null);

		const mountReactComponent = (component) => {
			const Component = makeReactContainer(component);
			const children =
				this.$slots.default !== undefined
					? { children: this.$slots.default }
					: {};

			useEffect(() => {
				const reactElement = (
					<Component
						{...this.$props.passedProps}
						{...this.$attrs}
						{...this.$listeners}
						{...children}
						ref={reactComponentRef}
					/>
				);
				ReactDOM.render(reactElement, this.$refs.react);

				return () => {
					ReactDOM.unmountComponentAtNode(this.$refs.react);
				};
			}, [component, this.$props.passedProps, this.$attrs, this.$listeners]);
		};
		return { reactComponentRef, mountReactComponent };
	},
};
