import {consumeEither, consumeExpression, consumeLiteral} from "./consumers";

export const parseTemplate = (template) => {
    let ret = [];

    for (;template.length;) {
        const result = consumeEither(template, [
            consumeExpression,
            consumeLiteral,
        ]);

        if (result) {
            template = template.substring(result.length);
            ret.push(result.value);
        } else {
            throw "Unexpected: " + template;
        }
    }

    return (resolveVar) => ret.map((token) => token(resolveVar));
};
