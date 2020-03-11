import { SimpleTypeKind } from "ts-simple-type";
import { Node, PropertyLikeDeclaration, PropertySignature, SetAccessorDeclaration } from "typescript";
import { getMemberVisibilityFromNode, getModifiersFromNode, getNodeSourceFileLang } from "../../util/ast-util";
import { getJsDoc } from "../../util/js-doc-util";
import { lazy } from "../../util/lazy";
import { resolveNodeValue } from "../../util/resolve-node-value";
import { AnalyzerDeclarationVisitContext, ComponentMemberResult } from "../analyzer-flavor";
import { getWapitisPropertyDecoratorConfig } from "./parse-wapitis-property-configuration";

/**
 * Parses wapitis-related declaration members.
 * This is primary by looking at the "@property" decorator and the "static get properties()".
 * @param node
 * @param context
 */
export function discoverMembers(node: Node, context: AnalyzerDeclarationVisitContext): ComponentMemberResult[] | undefined {
	const { ts } = context;

	// Never pick up members not declared directly on the declaration node being traversed
	if (node.parent !== context.declarationNode) {
		return undefined;
	}

	// @property({type: String}) myProp = "hello";
	else if (ts.isSetAccessor(node) || ts.isGetAccessor(node) || ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) {
		return parsePropertyDecorator(node, context);
	}
}

/**
 * Visits a wapitis property decorator and returns members based on it.
 * @param node
 * @param context
 */
function parsePropertyDecorator(
	node: SetAccessorDeclaration | PropertyLikeDeclaration | PropertySignature,
	context: AnalyzerDeclarationVisitContext
): ComponentMemberResult[] | undefined {
	const { ts, checker } = context;

	// Parse the content of a possible wapitis "@property" decorator.
	const wapitisConfig = getWapitisPropertyDecoratorConfig(node, context);

	if (wapitisConfig != null) {
		const propName = node.name.getText();

		// Get the attribute based on the configuration
		const attrName = getWapitisAttributeName(propName);

		// Find the default value for this property
		const initializer = "initializer" in node ? node.initializer : undefined;
		const resolvedDefaultValue = initializer != null ? resolveNodeValue(initializer, context) : undefined;
		const def = resolvedDefaultValue != null ? resolvedDefaultValue.value : initializer?.getText();

		// Find our if the property/attribute is required
		//const required = ("initializer" in node && isPropertyRequired(node, context.checker)) || undefined;
		const required = undefined;

		const jsDoc = getJsDoc(node, ts);

		// Emit a property with "attrName"
		return [
			{
				priority: "high",
				member: {
					kind: "property",
					propName,
					attrName,
					type: lazy(() => {
						const propType = checker.getTypeAtLocation(node);
						const inJavascriptFile = getNodeSourceFileLang(node) === "js";
						return inJavascriptFile && typeof wapitisConfig.type === "object" && wapitisConfig.type.kind === SimpleTypeKind.ANY
							? wapitisConfig.type
							: propType;
					}),
					node,
					default: def,
					required,
					jsDoc,
					meta: wapitisConfig,
					visibility: getMemberVisibilityFromNode(node, ts),
					modifiers: getModifiersFromNode(node, ts)
				}
			}
		];
	}

	return undefined;
}

/**
 * Returns an attribute name based on a property name and a wapitis-configuration
 * @param propName
 * @param wapitisConfig
 * @param context
 */
function getWapitisAttributeName(propName: string): string | undefined {
	// Get the property name.
	return propName;
}
