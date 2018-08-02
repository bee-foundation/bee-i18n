
export const consumeExpression = (template) => {
    if (template[0] !== "$") {
        return null;
    }
    const match = /^\$(\w+)(\()?/.exec(template);

    if (match[2]) {
        const {value, length} = consumeParams(template.substring(match[0].length));
        return {
            length: match[0].length + length + 1,
            value: (resolveVar) => resolveVar(match[1])(...value(resolveVar)),
        };
    } else {
        return {
            length: match[0].length,
            value: (resolveVar) => resolveVar(match[1]),
        };
    }
};

const consumeParams = (template) => {

    let resolveds = [];
    let length = 0;

    for (;;) {
        const result = consumeEither(template, [
            consumeExpression,
            consumeString,
        ]);
        if (result) {
            resolveds.push(result.value);
            template = template.substring(result.length);
            length += result.length;

            const commaResult = consumeComma(template);
            if (commaResult) {
                // console.log(commaResult)
                template = template.substring(commaResult.length);
                length += commaResult.length;
                // continue
            } else {
                const spaceResult = consumeSpace(template);
                if (spaceResult) {
                    length += spaceResult.length;
                }

                break;
            }
        } else {
            const spaceResult = consumeSpace(template);
            if (spaceResult) {
                length += spaceResult.length;
            }
            break;
        }
    }
    return {value: (resolveVar) => resolveds.map((r) => r(resolveVar)), length};
};

const consumeSpace = (template) => {
    const match = /^\s+/.exec(template);
    if (match) {
        return {
            length: match.length,
        };
    }
};
const consumeComma = (template) => {
    const match = /^\s*,\s*/.exec(template);
    if (match) {
        return {
            length: match[0].length,
        };
    }
};

export const consumeEither = (template, consumes) => {
    for (const consume of consumes) {
        const result = consume(template);
        if (result) {
            return result;
        }
    }
};

const consumeString = (template) => {
    if (template[0] === "'") {
        const end = template.indexOf("'", 1);
        return {
            value: () => template.substring(1, end),
            length: end+1,
        }
    } if (template[0] === '"') {
        const end = template.indexOf('"', 1);
        return {
            value: () => template.substring(1, end),
            length: end+1,
        }
    }
    throw `Unhandled string type ${template}`;
};

export const consumeLiteral = (template) => {
    const found = indexOfEither(template, ["$", "\\"]);

    if (found == null) {
        return {
            value: () => template,
            length: template.length,
        }
    } else if (found.index === 0) {
        return null;
    } else {
        return {
            value: () => template.substring(0, found.index),
            length: found.index,
        };
    }
};

const indexOfEither = (str, either) => {
    for (const t of either) {
        const indexOf = str.indexOf(t);
        if (indexOf > -1) {
            return {value: t, index: indexOf};
        }
    }
    return null;
};