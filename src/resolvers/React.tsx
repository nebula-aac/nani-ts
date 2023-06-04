import isReactComponent from "../utils/isReactComponent";
import { VueWrapper } from "../";

type ReactComponent = JSX.Element;

type ReactResolverFn<T> = T extends ReactComponent
	? T
	: (props: { component: T }) => JSX.Element;

export default function ReactResolver<T>(component: T): ReactResolverFn<T> {
	const RenderVueWrapper = VueWrapper as unknown as (props: {
		component: any;
	}) => ReactComponent;

	if (isReactComponent(component)) {
		return component as ReactResolverFn<T>;
	}

	const VueComponentWrappr = ((props: { component: T }) => (
		<RenderVueWrapper {...props} component={component} />
	)) as ReactResolverFn<T>;

	return VueComponentWrappr;
}
