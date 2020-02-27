import { AnalyzerVisitContext } from "../../analyzer-visit-context";
import { ComponentMethod } from "../../types/features/component-method";
import { AnalyzerFlavor } from "../analyzer-flavor";

export const refineFeature: AnalyzerFlavor["refineFeature"] = {
	method: (method: ComponentMethod, context: AnalyzerVisitContext): ComponentMethod | undefined => {
		// Outscope "statics" for now
		if (WAPITIS_PROTECTED_METHODS.includes(method.name)) {
			return {
				...method,
				visibility: "protected"
			};
		}

		return method;
	}
};

const WAPITIS_PROTECTED_METHODS = ["beforeRender", "render", "firstUpdated", "updated", "shouldUpdate"];
