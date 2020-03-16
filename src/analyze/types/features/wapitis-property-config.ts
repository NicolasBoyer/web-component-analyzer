import { SimpleType } from "ts-simple-type";
import { CallExpression, Node } from "typescript";

export interface WapitisPropertyConfig {
	type?: SimpleType | string;
	attribute?: string | boolean;
	node?: {
		type?: Node;
		attribute?: Node;
		decorator?: CallExpression;
	};
	hasConverter?: boolean;
	default?: unknown;
}
