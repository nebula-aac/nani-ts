import { ComponentOptions, defineComponent, VNode } from "vue";
import { ReactWrapper } from "../";

const VueResolverComponent = defineComponent({});

type VueResolverComponent = ComponentOptions<
	InstanceType<typeof VueResolverComponent>
>;

type CreateElementFn = (
	tag: string | object,
	data?: any,
	children?: VNode[],
) => VNode;

type RenderFn = (createElement: CreateElementFn) => VNode;

type VueResolverFn<T extends VueResolverComponent> = (component: T) => {
	components: {
		ReactWrapper: typeof ReactWrapper;
	};
	props: ["passedProps"];
	inheritAttrs: false;
	render: RenderFn;
};

const VueResolver: VueResolverFn<VueResolverComponent> = (component) => {
	return {
		components: { ReactWrapper },
		props: ["passedProps"],
		inheritAttrs: false,
		render(createElement) {
			return createElement(
				"react-wrapper",
				{
					props: {
						component,
						passedProps: this.$props.passedProps,
					},
					attrs: this.$attrs,
					on: this.$listeners,
				},
				this.$slots.default,
			);
		},
	};
};

export default VueResolver;
