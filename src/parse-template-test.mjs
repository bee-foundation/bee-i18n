import {parseTemplate} from "./parse-template";


// parseTemplate("$plural($0, 'Service')", createResolveVar([6], "en"));
console.log(parseTemplate("Hello $0 ha ha $plural($0, 'Service')he he")((varName) => {
    if (varName == 0) {
        return "AA"
    } else {
        return (v1, v2) => `PLURAL(${v1},${v2})`;
    }
}));
