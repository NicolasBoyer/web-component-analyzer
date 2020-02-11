import { Node } from "typescript";
import { AnalyzerVisitContext } from "../../analyzer-visit-context";
import { getDeclarationName } from "../../util/ast-util";

export function excludeNode(node: Node, context: AnalyzerVisitContext): boolean | undefined {
	if (context.config.analyzeLib) {
		return undefined;
	}

	// Exclude Wapitis related super classes if "analyzeLib" is false
	const declName = getDeclarationName(node, context);
	if (declName != null) {
		return declName === "Component";
	} else {
		const fileName = node.getSourceFile().fileName;

		return fileName.includes("/component.");
	}
}
