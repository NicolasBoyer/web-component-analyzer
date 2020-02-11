import { SimpleTypeKind } from "ts-simple-type";
import { CallExpression, Expression, Node, ObjectLiteralExpression } from "typescript";
import { AnalyzerVisitContext } from "../../analyzer-visit-context";
import { WapitisPropertyConfig } from "../../types/features/wapitis-property-config";

export type WapitisPropertyDecoratorKind = "property" | "internalProperty";

export const WAPITIS_PROPERTY_DECORATOR_KINDS: WapitisPropertyDecoratorKind[] = ["property", "internalProperty"];

/**
 * Returns a potential wapitis element property decorator.
 * @param node
 * @param context
 */
export function getWapitisPropertyDecorator(
	node: Node,
	context: AnalyzerVisitContext
): { expression: CallExpression; kind: WapitisPropertyDecoratorKind } | undefined {
	if (node.decorators == null) return undefined;
	const { ts } = context;

	// Find a decorator with "property" name.
	for (const decorator of node.decorators) {
		const expression = decorator.expression;

		// We find the first decorator calling specific identifier name (found in WAPITIS_PROPERTY_DECORATOR_KINDS)
		if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
			const identifier = expression.expression;
			const kind = identifier.text as WapitisPropertyDecoratorKind;
			if (WAPITIS_PROPERTY_DECORATOR_KINDS.includes(kind)) {
				return { expression, kind };
			}
		}
	}
}

/**
 * Returns a potential wapitis property decorator configuration.
 * @param node
 * @param context
 */
export function getWapitisPropertyDecoratorConfig(node: Node, context: AnalyzerVisitContext): undefined | WapitisPropertyConfig {
	const { ts } = context;

	// Get reference to a possible "@property" decorator.
	const decorator = getWapitisPropertyDecorator(node, context);

	if (decorator != null) {
		// Parse the first argument to the decorator which is the wapitis-property configuration.
		const configNode = decorator.expression.arguments[0];

		// Add decorator to "nodes"
		const config: WapitisPropertyConfig = { node: { decorator: decorator.expression } };

		// Apply specific config based on the decorator kind
		switch (decorator.kind) {
			case "internalProperty":
				config.attribute = false;
				break;
		}

		// Get wapitis options from the object literal expression
		return configNode != null && ts.isObjectLiteralExpression(configNode) ? getWapitisPropertyOptions(configNode, context, config) : config;
	}

	return undefined;
}

/**
 * Parses an object literal expression and returns a wapitis property configuration.
 * @param node
 * @param existingConfig
 * @param context
 */
export function getWapitisPropertyOptions(
	node: ObjectLiteralExpression,
	context: AnalyzerVisitContext,
	existingConfig: WapitisPropertyConfig = {}
): WapitisPropertyConfig {
	const { ts } = context;

	// Build up the property configuration by looking at properties in the object literal expression
	return node.properties.reduce((config, property) => {
		if (!ts.isPropertyAssignment(property)) return config;

		const initializer = property.initializer;
		const kind = ts.isIdentifier(property.name) ? property.name.text : undefined;

		return parseWapitisPropertyOption({ kind, initializer, config }, context);
	}, existingConfig);
}

export function parseWapitisPropertyOption(
	{ kind, initializer, config }: { kind: string | undefined; initializer: Expression; config: WapitisPropertyConfig },
	context: AnalyzerVisitContext
): WapitisPropertyConfig {
	const { ts } = context;

	// noinspection DuplicateCaseLabelJS
	switch (kind) {
		case "attribute": {
			const attribute: WapitisPropertyConfig["attribute"] | undefined = true;

			return {
				...config,
				attribute,
				node: {
					...(config.node || {}),
					attribute: initializer
				}
			};
		}

		case "type": {
			let type: WapitisPropertyConfig["type"] | undefined;
			const value = ts.isIdentifier(initializer) ? initializer.text : undefined;

			switch (value) {
				case "String":
				case "StringConstructor":
					type = { kind: SimpleTypeKind.STRING };
					break;
				case "Number":
				case "NumberConstructor":
					type = { kind: SimpleTypeKind.NUMBER };
					break;
				case "Boolean":
				case "BooleanConstructor":
					type = { kind: SimpleTypeKind.BOOLEAN };
					break;
				case "Array":
				case "ArrayConstructor":
					type = { kind: SimpleTypeKind.ARRAY, type: { kind: SimpleTypeKind.ANY } };
					break;
				case "Object":
				case "ObjectConstructor":
					type = { kind: SimpleTypeKind.OBJECT, members: [] };
					break;
				default:
					// This is an unknown type, so set the name as a string
					type = initializer.getText();
					break;
			}

			return {
				...config,
				type,
				node: {
					...(config.node || {}),
					type: initializer
				}
			};
		}
	}

	return config;
}
